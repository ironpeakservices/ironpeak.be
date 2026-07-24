+++
date = "2026-07-23T09:37:00+01:00"
tags = ["ps4","exploit","kernel","ppp","rce","jailbreak","goldhen","cve-2006-4304","console","reverse-engineering"]
description = "A cited deep dive into the PS4 FW 11.00 PPP-based kernel exploit: why PlayStation jailbreaking exists, how PS4's FreeBSD-based OS works, the real CVE-2006-4304 advisory and patch, and what it means for PS5."
layout = "blog"
draft = false
+++

# PPPwned: The Bug That Outlived Dial-Up

## Jailbreaking a PlayStation: the why and the how

"Jailbreaking" a PlayStation means bypassing Sony's software restrictions so you can run unsigned code on the console, code Sony hasn't approved or cryptographically signed. People do it for a lot of reasons: homebrew apps and emulators, playing backups of games they own, restoring features Sony has stripped out of older consoles, preserving games that have gone out of print, or just the challenge of reverse engineering a locked-down system. It's also just how the hacking and security-research scene around consoles works. PlayStation hardware is a hardened embedded Unix system, and each console generation ends up being a benchmark for what a determined research effort can still get through.

**What's actually running under the hood.** The PS4's OS, internally called Orbis OS, is a fork of FreeBSD, the open-source Unix that also shares ancestry with parts of macOS's Darwin/XNU kernel. Sony took FreeBSD's kernel and userland, stripped it down and modified it heavily, then wrapped the whole thing in a proprietary, closed-source graphical shell: the console UI you actually see, with your library, friends list, and store, running as a privileged userland app on top of that modified FreeBSD base. Underneath that shell it's still a BSD-shaped OS: processes, syscalls, a VFS, a TCP/IP stack, and, critically for this post, the same legacy networking drivers FreeBSD itself has carried for decades. `sppp(4)` is one of them.

**How a jailbreak chain usually works.** PS4 exploitation historically followed a layered formula. A browser exploit (the console ships a WebKit-based browser) gets you unprivileged code execution in a sandboxed process. A second bug escapes that sandbox. A kernel vulnerability chains on top to escalate from userland into ring-0, where the console's code-signing checks, syscall restrictions, and general "jail" can finally be turned off. Firmware 9.00 was the last major milestone built on that browser-first formula.

PPPwn skips the first two stages entirely. Instead of going in through a user-facing entry point like the browser, it goes straight for the kernel over the network, through a legacy protocol implementation that was never hardened against a determined attacker. That's the "different kind of entry point" this whole post is about.

## Introduction

For years, PlayStation 4 exploitation followed a predictable formula: gain code execution through the browser, escape the sandbox, then use a kernel vulnerability to take full control. Firmware 9.00 marked the last major milestone in that lineage.

Firmware 11.00 broke that pattern. Not because the system got meaningfully more secure, but because the entry point moved somewhere far less obvious: the network stack.

This post is a cited walkthrough of the PPP-based kernel exploit publicly released as **PPPwn** by Andy Nguyen (theflow0), <cite index="5-1">a kernel remote code execution exploit for PlayStation 4 up to firmware 11.00</cite>. Every technical claim about the underlying bug traces back to the original FreeBSD security advisory, FreeBSD's actual 2006 patch, and Sony's own HackerOne disclosure of the rediscovery. It doesn't reconstruct the console-specific weaponization: the heap grooming, KASLR defeat, and ROP chain TheFlow built on top of the bug and covered in his TyphoonCon talk. Those specifics aren't public, so they aren't guessed at here.

---

## A Different Kind of Entry Point

Most console exploits target complex, user-facing components: browsers, media decoders, file parsers. These are large, exposed, and get attacked constantly.

PPP (Point-to-Point Protocol) is none of those things. It sits much lower in the networking stack, running the link-negotiation state machine before any higher-level traffic even exists. On the PS4, PPP shows up over Ethernet through PPPoE, the same "PPP over Ethernet" mode ISPs used for DSL-style dial-up authentication. That's exactly why the PPPwn tool works the way it does: an attacker's machine just presents itself as a PPPoE server.

Under the right conditions, the console will try to establish a PPP session with whatever's on the other end of the cable. That endpoint doesn't need to be legitimate. If you control it, you control the entire protocol conversation, packet by packet, before any authentication or higher-level trust has kicked in.

---

## Why PPP Is Interesting

PPP was designed in a very different era of computing, one where memory safety wasn't strongly enforced, input validation was often minimal, and performance mattered more than robustness.

The specific driver here is `sppp(4)`, FreeBSD's kernel component implementing the PPP/HDLC state machine and Link Control Protocol (LCP). The PS4/PS5's Orbis kernel is a heavily modified FreeBSD derivative and inherited this driver wholesale, legacy code ported over rather than rewritten.

The exploit leverages **CVE-2006-4304**, assigned by the FreeBSD Security Team on 23 August 2006 in advisory **FreeBSD-SA-06:08.ppp**. The advisory's own problem description is basically the whole bug in one sentence: <cite index="22-1">while processing Link Control Protocol configuration options received from the remote host, sppp(4) fails to correctly validate option lengths, which may result in data being read or written beyond the allocated kernel memory buffer</cite>. Its impact statement is just as blunt: <cite index="22-1">an attacker able to send LCP packets can cause the FreeBSD kernel to panic, and may also be able to obtain sensitive information or gain elevated privileges</cite>.

Remote, unauthenticated, pre-negotiation, kernel-memory-corruption bug, in nineteen words, from an eighteen-year-old advisory.

---

## The Bug: A Familiar Story

At its core this is a length-validation failure in a TLV (type-length-value) parser, not a raw `memcpy`. LCP and IPCP options in a PPP packet are simple TLVs: one byte for `type`, one byte for `length` (inclusive of those two header bytes), then `length - 2` bytes of data. A correct parser walks this list by reading `type`, reading `length`, and advancing by `length` each time, but only after checking that `length` makes sense and doesn't run past what's actually left in the buffer.

The pre-2006 FreeBSD loop looked like this (the same pattern showed up in six near-identical option-parsing routines across LCP, IPCP, and IPv6CP):

```c
for (rlen = 0; len > 1 && p[1]; len -= p[1], p += p[1]) {
    ...
}
```

Two checks are missing here, and both matter:

1. Nothing confirms `p[1]` (the attacker-supplied option length) is at least 2. A `length` of 0 or 1 makes the loop advance by a nonsensical amount, or not advance at all.
2. Nothing confirms `p[1]` is less than or equal to the remaining `len`. The loop just trusts the attacker's stated option length even when it claims to run past the actual end of the packet buffer.

Sony's own HackerOne report names the resulting primitive directly: <cite index="16-1">heap buffer overwrite and overread in sppp_lcp_RCR and sppp_ipcp_RCR</cite>, the option-parsing functions for LCP and IPCP "Configure-Request" handling. Whoever controls the length byte of a single PPP option controls how far past a kernel heap buffer the driver reads and writes.

### Down at the byte level

Here's what the parser actually holds in memory. An LCP Configure-Request arrives as a header followed by a flat run of option TLVs, and the kernel hands the parser a cursor `p` plus a `len` telling it how many bytes remain:

```
received packet buffer (heap-allocated, size = header + options_len)

┌──────────┬──────┬──────┬───────────┬──────┬──────┬───────────┬── … ──┐
│ LCP hdr  │ type │ len  │  data...  │ type │ len  │  data...  │  ...  │
│ (4 bytes)│  1B  │  1B  │(len-2 B)  │  1B  │  1B  │(len-2 B)  │       │
└──────────┴──────┴──────┴───────────┴──────┴──────┴───────────┴───────┘
            ▲
            p = (void*)(h+1)   // cursor starts right after the header
            len = origlen      // total bytes of option data claimed by the header
```

Each iteration reads `p[0]` (the option type) to decide what to do with it, reads `p[1]` (the option's self-declared length), then steps the cursor forward by that same `p[1]` and subtracts it from the remaining `len` budget. The pointer arithmetic and the trust boundary are the same operation. Nothing separately re-checks the step before taking it:

```c
for (rlen = 0; len > 1 && p[1]; len -= p[1], p += p[1]) {
    // assumption A (unchecked): p[1] >= 2
    // assumption B (unchecked): p[1] <= len
    switch (*p) { /* handle option type p[0] */ }
}
```

Walk a malformed packet through it. Say the real option data left in the buffer is 6 bytes (`len = 6`), and the attacker's first option header claims `type = 0x03, length = 0xF0` (240), an option that says it's 240 bytes long while sitting in a buffer that only has 6 bytes left:

```
iteration 1:
  loop guard:  len > 1  → 6 > 1  → true
               p[1]     → 0xF0 (240) → non-zero → true
               (nothing checks 240 <= 6, nothing checks 240 >= 2)
  body runs:   switch (*p) copies/compares up to `length - 2` = 238 bytes of
               "option data" that some LCP option types (vendor-extension,
               magic-number fields) read or write directly
  cursor step: len -= p[1]   → 6 − 240  → wraps to a huge unsigned value
               p   += p[1]   → cursor jumps 240 bytes past a 6-byte buffer

iteration 2:
  loop guard:  len > 1  → (huge wrapped number) > 1 → true, loop keeps going
               p[1]     → whatever byte happens to sit 241 bytes past the buffer
```

Two failures stack on top of each other here. First, inside iteration 1, if the option type's handler reads or copies `length - 2` bytes, it's doing that from a cursor backed by only 4 real remaining bytes: an out-of-bounds read, or an out-of-bounds write if that option type stores attacker-controlled data into a kernel-side field. Second, the unsigned underflow on `len -= p[1]` means the loop's own exit condition is now lying to it. Instead of correctly signaling "no data left, stop," it wraps to something near `2^32` or `2^64` and keeps going, walking arbitrarily far past the original allocation on the next iteration, using whatever bytes happen to sit in adjacent heap memory as the next "type/length" pair. That second failure is what turns one bad option into a sustained walk through kernel heap memory instead of a single bounded overrun.

---

## The Actual Fix, and Why It Closes Both Failures

Here's the fix FreeBSD shipped in patch SA-06:08, applied identically across all six copies of the loop:

```diff
- for (rlen=0; len>1 && p[1]; len-=p[1], p+=p[1]) {
+ for (rlen=0; len >= 2 && p[1] >= 2 && len >= p[1];
+     len-=p[1], p+=p[1]) {
```

Three clauses, three failure modes closed:

- `len >= 2`: enough bytes have to remain for a minimal option header to exist at all.
- `p[1] >= 2`: the declared length has to be at least the header size, closing off the zero/one-length case.
- `len >= p[1]`: the declared length can't exceed what's actually left in the buffer.

Map that back onto the walkthrough above and `len >= p[1]` is the clause that stops iteration 1 from ever reaching the `switch (*p)` body with `length = 240` against a 6-byte remainder. The loop guard now fails before the body runs. And because the guard fails on that same iteration, `len -= p[1]` never executes with an oversized `p[1]`, which removes the unsigned-underflow path that let the loop free-run in iteration 2. One added comparison closes both failure modes at once, because they shared the same unchecked value.

There's nothing novel about this bug class. What's novel is where it still existed nineteen years later.

---

## How Does This Still Exist?

The answer is software reuse. `sppp(4)` is FreeBSD kernel networking code, and the PS4/PS5's Orbis kernel forked from FreeBSD at some point. FreeBSD's fix landed within a day of disclosure back in 2006, but Sony's fork either predated that fix or the vulnerable pattern got reintroduced later, and the bug rode along quietly until TheFlow rediscovered it and reported it through Sony's HackerOne program.

Networking stacks are rarely rewritten from scratch. They get ported across systems, modified incrementally, folded into larger codebases, and along the way they accumulate assumptions: input will be well-formed, rarely-reached code paths are "good enough" as they are. Those assumptions are exactly what reduce scrutiny. PPPoE dial-up-style negotiation is something almost nobody manually audits on a modern console, because almost nobody uses PPP directly anymore. That's exactly why it was still sitting there to find.

---

## Reaching the Vulnerable Code

To trigger the bug, the vulnerable code path actually has to run, which means placing a controlled system between the PS4 and the network, acting as a malicious PPPoE server. That's literally what the released `PPPwn` tool does: it speaks the PPPoE discovery and LCP negotiation stages from the attacker's machine and waits for the console to dial in.

When the PS4 tries to connect, it initiates PPPoE discovery and PPP/LCP negotiation, the attacker's machine responds as the server, and from there the attacker controls every packet exchanged, including the malformed LCP options above.

At that point the console's kernel is parsing attacker-controlled input inside `sppp_lcp_RCR` / `sppp_ipcp_RCR`, at the byte level shown earlier.

---

## Triggering the Overflow

During LCP negotiation, crafted Configure-Request frames carrying option TLVs whose declared `length` exceeds what the buffer actually holds get sent to the PS4. These frames trigger the same two failure modes described above: an out-of-bounds read/write inside a single option, and an underflowed loop counter that keeps the parser walking past the original allocation.

The result is memory corruption in the kernel heap. Early on that can look like crashes or hangs while an attacker refines their crafted values. TheFlow's TyphoonCon abstract describes the goal past that point as using <cite index="13-1">internals of the protocol to achieve an information leak and to redirect control flow to get RCE with kernel privileges</cite>. The specific heap layout, leak primitive, and control-flow redirection used to get there on Orbis are covered in the talk and the exploit source, not reconstructed here.

---

## From Memory Corruption to Code Execution

Memory corruption on its own isn't enough. The goal is redirecting execution. Depending on what sits next to the overrun in the kernel heap, that can mean return addresses, function pointers, or other control-relevant structures getting hit. Turning a raw out-of-bounds heap primitive into reliable kernel RCE is generally an iterative process: shape input, observe behavior, refine assumptions. That lines up with why practitioners at the time noted PS4-era mitigations made this route tractable in a way porting the same bug to PS5 wasn't: <cite index="9-1">PS4 is much weaker in terms of mitigations, which played a part in allowing a remote exploit without userland code execution, while PS5's SMAP and CFI make the same route much harder</cite>.

---

## Establishing a Foothold

Once execution is redirected, a chain like this usually doesn't get full control in one step. It typically establishes something minimal first, some limited control over execution flow, and builds from there toward arbitrary kernel read/write and the ability to disable protection mechanisms. That staged approach is the general shape kernel exploits take once the initial memory-corruption primitive is in hand. The specific staging TheFlow used for PPPwn is documented in the exploit's own source and talk, not here.

---

## The Role of GoldHEN

With kernel access achieved, the exploit moves into a post-exploitation phase, and that's where **GoldHEN** comes in. GoldHEN isn't the exploit itself, it's the payload/plugin framework that runs after successful exploitation: debug settings access, package installation support, FTP-based file system access, runtime patching. Community coverage of the PPPwn release at the time noted GoldHEN support was already running against it in testing not long after the release. Without a payload like GoldHEN, the exploit stays a proof-of-concept that just prints a confirmation string, which is in fact exactly what the public PPPwn release does on its own: <cite index="5-1">the exploit only prints "PPPwned" on the PS4 as a proof-of-concept</cite>. Launching homebrew enablers means adapting the payload stage separately.

---

## Why the Exploit Is Not Persistent

A key limitation of this jailbreak is that it doesn't persist, and that's a direct consequence of how it works rather than a design flaw. The exploit doesn't touch firmware on disk or the boot chain, it only patches the running kernel image in memory. Reboot the system and memory resets, the modifications are gone, and the console is back to its original state. Safer for the console, but it means re-running the exploit after every restart.

---

## Reliability and Timing

Unlike browser-based exploits, PPP negotiation comes with its own state transitions and packet-timing dependencies, so small environmental differences can affect success rates: OS scheduling, network stack latency, packet delivery timing on the attacker's side. That's a known characteristic of this class of exploit rather than anything specific to one particular implementation of PPPwn.

---

## Automating the Exploit

To cut down on friction, the PPPoE-server side can run from a dedicated always-on device like a Raspberry Pi instead of a laptop that needs manual reconnecting each time. The device acts as the PPPoE server, delivers the exploit automatically when the console tries to connect, and can bridge normal network traffic afterward, turning a manual, cable-swapping process into a permanent, repeatable intermediary between the console and the network. That's a deployment pattern the community built around the public tool, not a change to the underlying bug.

---

## What This Tells Us

A few lessons here, each traceable to the sourced material above rather than general inference.

**Legacy code is a long-term liability.** A vulnerability patched in FreeBSD in a day back in 2006 apparently sat unfixed in a forked kernel for roughly eighteen years before it mattered again, on hardware FreeBSD's own security team never touched.

**Network stacks are high-value targets.** A protocol almost nobody manually audits anymore, PPPoE dial-up negotiation, was still there, still reachable pre-authentication, still wired directly into the kernel.

**Assumptions are the weakest link, and they're cheap to fix.** The entire vulnerability class got closed with three added boolean clauses on one loop condition, repeated six times. Whatever difficulty existed in this exploit lived entirely downstream of that gap, in turning the resulting primitive into reliable RCE, not in the bug itself.

---

## Closing Thoughts

The PS4 FW 11.00 PPP exploit isn't just about a single vulnerability. It's a chain of overlooked decisions: reusing legacy code, underestimating an obscure attack surface, trusting a length field that came off the wire. By stepping outside traditional exploitation paths and going after the network layer, PPPwn shows that meaningful vulnerabilities often sit right where attention is lowest, sometimes for two decades at a time.

---

## Looking Ahead: What About PS5?

The same root cause wasn't unique to the PS4. Community reporting around the PPPwn release noted that <cite index="9-1">PS5 firmware up to 8.20 was also confirmed vulnerable to CVE-2006-4304</cite>, which isn't surprising given the PS5 kernel shares the same FreeBSD-derived lineage and, apparently, the same unpatched `sppp(4)` parsing loop. The bug showing up on both platforms is exactly what you'd expect from legacy code inherited once and carried forward across console generations, rather than something reintroduced independently on each one.

Having the same bug doesn't mean having the same exploit though. Researchers in the scene were pretty explicit at the time that a straight port of the PS4 technique wasn't realistic: <cite index="9-1">PS4 is much weaker in terms of mitigations, which played a part in allowing a remote exploit without userland code execution, while PS5's SMAP and CFI make the same route much harder</cite>. Discussion at the time also raised **XOM** (execute-only memory, which blocks reading executable pages to harvest ROP gadgets) as another obstacle even if the control-flow integrity checks got worked around somehow. The practical read at the time was that getting from this bug to PS5 kernel RCE would need a different strategy altogether, likely a separate userland foothold plus a dedicated read/write primitive, rather than the PS4 chain's more direct path.

That's deliberately where public detail on the PS5 side stops. Whether a working PS5 chain from this exact CVE has since been built isn't something this post tries to reconstruct. The bug being shared across platforms is public and citable. A functioning PS5-specific bypass of SMAP/CFI/XOM is not, and guessing at the missing pieces would cross the same line the rest of this post has stayed on the right side of.

More broadly, the pattern this bug points at doesn't go away just because FreeBSD's three-clause fix has existed upstream since 2006. Every console generation forks a general-purpose OS, and every fork is a fresh chance for an old, already-patched-elsewhere bug to quietly tag along unless someone deliberately re-audits legacy code paths against the parent project's security history. As PS5 (and whatever comes after it) tightens its userland and kernel mitigations, the cost of exploitation goes up. SMAP, CFI, and XOM are real barriers. But the underlying lesson from PPPwn holds regardless of platform: the parts of an OS that get the least ongoing scrutiny are usually exactly the parts still running code nobody's looked at in twenty years.

---

## Sources

- [FreeBSD-SA-06:08.ppp](https://www.freebsd.org/security/advisories/FreeBSD-SA-06:18.ppp.asc), the original 2006 advisory and CVE-2006-4304 description.
- [FreeBSD's official patch for SA-06:08](http://security.freebsd.org/patches/SA-06:18/ppp.patch), the actual before/after diff quoted above.
- [PlayStation's HackerOne report #2177925, "Remote vulnerabilities in spp"](https://hackerone.com/reports/2177925), Sony's own disclosure of the PS4/PS5 rediscovery, bounty, and resolution timeline.
- [TheOfficialFloW/PPPwn on GitHub](https://github.com/TheOfficialFloW/PPPwn), the public proof-of-concept release notes and supported firmware list.
- TyphoonCon 2024 talk abstract, "PlayStation 4 Kernel RCE" (Andy Nguyen / theflow0), the first-person framing of scope and technique category.

