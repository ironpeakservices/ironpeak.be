+++
date = "2026-05-23T00:00:00+02:00"
title = "Pardon MIE?"
tags = ["apple","macos","ios","kernel","mie","exploit","cve-2026-28952","calif","anthropic","mythos"]
description = "How Calif and Anthropic's Mythos cracked Apple's brand-new Memory Integrity Enforcement on the M5 in five days, what the bug actually is, and what defenders and exploit writers should take from it."
layout = "blog"
draft = false
+++

**Apple's Memory Integrity Enforcement is no joke. Five years of design, brand-new M5 silicon, hardware memory tagging on the kernel heap, hardware-locked read-only zones for the kernel's crown jewels, and a privileged monitor sitting above the kernel that refuses every unauthorised page-table change. It's the most serious kernel memory-safety stack any consumer OS has shipped. And it still got bypassed. A three-person shop with an AI sidekick walked through it in five days, with two bugs and a clever idea. Here's my rundown of how they achieved it, no PhD required.**

Skip ahead if you want:

- [The bug, in 60 seconds](#the-bug-in-60-seconds)
- [The fix, in two instructions](#the-fix-in-two-instructions)
- [For defenders](#for-defenders)
- [For exploit writers](#for-exploit-writers)

### Why memory safety matters

Almost every "your iPhone got hacked" story you've ever read comes back to the same root cause: a memory bug. A pointer that pointed at the wrong thing. A buffer that wrote one byte too many. A struct that got reused after it was supposed to be freed.

It's not the user clicking a sketchy link. It's not a stolen password. It's the kernel reading from a piece of memory and trusting it just a little too much.

Pegasus, the NSO Group spyware that ended up on journalists and activists worldwide? Memory bug. The WebKit zero-clicks used in targeted operations all through the 2020s? Memory bugs. The checkm8 jailbreak that owned every iPhone from the 5s through the X? Memory bug. The [T2 vulnerability I wrote about a few years ago](/blog/crouching-t2-hidden-danger/)? Same family.

Google's Project Zero has been counting these for years. Roughly **70%** of high-severity vulnerabilities across all major software products are memory-safety bugs. Microsoft counted theirs and got the same number. Chrome did, Firefox did, Apple did. The whole industry agrees: this is *the* problem.

So what does an attacker actually do with a memory bug?

In the worst case, anything they want. The kernel is the program that runs every other program. If you can corrupt the kernel's memory, you can rewrite the table that says "this process is allowed to read your photos", or "this user is uid=501". You can install something that survives a reboot. You can read every message the device has ever sent. You can flip the camera on without the LED. The phone you bought to keep your life private is now someone else's diary of your life.

This is why Apple, Microsoft, Google and the chip vendors have been pouring engineering at hardware-level memory safety for a decade. Compiler hardening, safer allocators, sandboxing: they all help, but they're a leaky bucket. The bugs keep coming. The thing that actually works is making the bugs *unexploitable* even when they exist. Stop trusting the software to be correct; build the hardware to refuse incorrect operations.

That's the bet MIE is making.

### Recap: what is MIE supposed to do?

If you've followed Apple's security marketing in the last year, you've heard MIE described as a "generational leap". It's three pieces, stacked.

**Memory tagging (EMTE).** Every chunk of memory the kernel hands out gets a hidden label, a tag. The pointer you use to reach that chunk has the same tag baked into its upper bits, where it doesn't change the address. On every access, the CPU checks: does the pointer's tag match the memory's tag? If not, your process dies on the spot. Apple's version is *synchronous*, which means the check fires on the access itself, not later. You can't guess tags by probing because the first wrong guess kills you.

**Read-only zones.** Some kernel structures are so juicy they get extra protection. Things like `ucred` (your process's user ID), the Mach task control block, the sandbox table, the codesigning state. They live in a special region where the page tables themselves mark the pages as unwritable. Even ring-0 kernel code can't touch them. The hardware MMU refuses.

**One door in.** Exactly one kernel function is allowed to mutate read-only-zone pages: `_zalloc_ro_mut`. It briefly marks a page writable, does its write, marks it unwritable again. A higher-privileged thing called the Secure Page Table Monitor watches every page-table change and refuses if anyone else tries. From the kernel's own perspective, "only `_zalloc_ro_mut` writes here" is unbreakable.

Stack those three together and you get MIE. Most kernel memory is tag-protected. The crown jewels are page-table-protected behind one audited writer. Pretty good design, honestly.

### What just happened?

On **11 May 2026** Apple shipped macOS Tahoe 26.5. Buried in [the security notes](https://support.apple.com/en-us/127115) was a one-liner:

> **Kernel.** Available for Mac computers with Apple Silicon. An app may be able to cause unexpected system termination. Credit: Calif.io in collaboration with Claude and Anthropic Research. CVE-2026-28952.

"Unexpected system termination" sounds like a crash bug. It is not. Three days later Calif published [their disclosure](https://blog.calif.io/p/first-public-kernel-memory-corruption): the first public macOS kernel exploit on an M5 with MIE enabled. Unprivileged local user, only public syscalls, root shell. Five days from "no bugs in hand" to working exploit. They used Anthropic's restricted Mythos Preview model throughout.

Apple's patch is **two instructions long**. Two. Those two instructions tell the whole story. Let me show you.

If you read arm64 assembly, here's the whole fix at a glance. We'll unpack it properly below.

```diff
--- com.apple.kernel @ macOS 26.4.1   :: _zalloc_ro_mut, bounds check
+++ com.apple.kernel @ macOS 26.5     :: _zalloc_ro_mut, bounds check
@@ argument validation @@
-    cmp   x8, x29              ; stack-frame sanity check (useless)
-    b.lo  skip_stack_check
-    ; 6 instructions of alignment-mask arithmetic
-    adds  x9, x8, x4           ; target + len, runs LATE
-    b.hs  range_check
+    mrs   x10, TPIDR_EL1       ; per-CPU pointer
+    adds  x9, x8, x4           ; target + len, runs FIRST
+    b.hs  per_cpu_check
+    ldr   x11, [x10, #0x158]   ; per-CPU bound marker
+    ldr   x10, [x10, #0xe8]    ; per-CPU RO subzone base
+    cmp   x8, x11
+    ccmp  x9, x11, #0x0, hs    ; NEW: target+len vs per-CPU lower
+    ccmp  x9, x10, #0x2, hs    ; NEW: target+len vs per-CPU upper
+    b.ls  panic
```

Three differences: a useless stack-overlap check is gone, the overflow check moved earlier, and a brand-new per-CPU bound was added. If that already makes sense to you, skim the rest. If not, read on.

### The bug, in 60 seconds

The whole thing lives in one kernel function: `_zalloc_ro_mut`. Here's its C-level signature:

```c
void _zalloc_ro_mut(zone_id_t zone,    // which RO zone
                    void     *target,  // slot to write into
                    size_t    offset,  // offset inside the slot
                    const void *src,   // bytes to copy in
                    size_t    len);    // how many bytes
```

Translation: "find this slot in this RO zone, and copy `len` bytes from `src` into `target + offset`". Before doing anything, it has to bounds-check that the destination plus the copy size doesn't run off the end of what's allocated. The 26.4.1 check looked like this in pseudocode (I'm dropping the `offset` parameter for clarity; the real code adds it to `target` upfront):

```c
// pre-patch (26.4.1)
uint64_t end = target + len;     // wait for it...
if (end < target) {              // overflow detection
    // wrap-handling path, uses `end` (already wrapped!)
    if (target >= ro_zone_lo && end <= ro_zone_hi)
        goto write_ok;           // 🤡
}
```

Spotted it? If `len` is huge enough that `target + len` wraps past `2^64`, then `end` becomes a tiny number. The wrap-handling path *still* compares this tiny `end` against the RO zone range. A tiny number is comfortably below `ro_zone_hi`, so the check passes. The function happily calls `memcpy(target, src, len)` with the *real* `len`, which writes way past the validated slot into whatever lives next door.

What lives next door in the RO zone? **Other `ucred` structures.** Other `task_t` blocks. AMFI state. Codesigning flags. The exact stuff MIE was built to protect.

That's CVE-2026-28952. Integer overflow in a bounds check. Apple's CVE wording, "*addressed with improved input validation*", finally makes sense.

### Memory layout, because pictures help

Quick mental model. The kernel is just a program. Like any program, it allocates memory and stores things in it. Picture the kernel's memory as a giant warehouse with different sections for different kinds of stuff. The general-purpose section, where most allocations land, is called the **kalloc heap**. The locked-down section for the high-value structures is the **RO zone** (read-only zone).

Drawn out:

```
high addresses ───────────────────────────────────────────────
│
│   ┌─────────────────────────────────────────────┐
│   │  kernel code & rodata                       │
│   └─────────────────────────────────────────────┘
│   ┌─────────────────────────────────────────────┐
│   │  general kalloc heap (EMTE tag-protected)   │  ← classic
│   │                                             │     UAF/OOB
│   └─────────────────────────────────────────────┘     bugs land
│                                                       here
│   ┌─────────────────────────────────────────────┐
│   │  RO allocator zones                         │  ← SPTM-locked
│   │  ┌─────────┬─────────┬─────────┬─────────┐  │     read-only,
│   │  │ ucred   │ task_t  │ amfi    │ ...     │  │     only
│   │  └─────────┴─────────┴─────────┴─────────┘  │     _zalloc_ro_mut
│   └─────────────────────────────────────────────┘     can write
│   ┌─────────────────────────────────────────────┐
│   │  per-CPU data (TPIDR_EL1 points here)       │
│   └─────────────────────────────────────────────┘
low addresses ────────────────────────────────────────────────
```

Three things to notice:

- The **kalloc heap** is where almost everything the kernel allocates lives. Network buffers, file descriptors, IPC messages, the works. Classic kernel exploits like use-after-free and out-of-bounds writes traditionally land here.
- The **RO zone** is the part Apple chose to lock down at the hardware level. The CPU's page tables mark these pages unwritable for the whole kernel. Even if you fully compromise the kernel and get an arbitrary-write primitive, you still can't touch these pages directly. There is exactly one exception: `_zalloc_ro_mut`.
- The **per-CPU data** at the bottom holds per-core bookkeeping. The `TPIDR_EL1` register on ARM64 points to it. Remember this part. It matters for the fix later.

Now zoom in on one slot in the RO zone. The structure we care about is `ucred`, the per-process "user credentials" struct. Whenever the kernel decides whether your process is allowed to do something, it checks the ucred. The interesting field is `cr_uid`, your effective user ID. `cr_uid == 0` means root. `cr_uid == 501` means me. Or you, probably.

RO zone slots of the same type sit packed together, like cubicles in an open-plan office. Each `ucred` is roughly 200 bytes. Here's what one looks like inside (from public XNU source, [`bsd/sys/ucred.h`](https://github.com/apple-oss-distributions/xnu)):

```c
struct ucred {
    os_refcnt_t  cr_ref;
    struct posix_cred {
        uid_t cr_uid;        // ← effective UID, the prize
        uid_t cr_ruid;       // ← real UID
        uid_t cr_svuid;      // ← saved UID
        short cr_ngroups;
        gid_t cr_groups[NGROUPS];
        // ...
    } cr_posix;
    struct label *cr_label;
    audit_token_t cr_audit;
    // ...
};
```

Flip a single 4-byte `cr_uid` field from `501` to `0` and your process is root. That's it. No code injection, no ROP, no shellcode. The kernel will happily accept on the next syscall that you are who the struct says you are.

Now the overflow itself, with some hand-holding.

The function takes `target` (where to write) and `len` (how many bytes). Before copying, it computes `target + len` to check that the write doesn't run past the validated slot. But ARM64 pointers are 64 bits wide, and 64-bit arithmetic *wraps*. If `target + len` is larger than the biggest 64-bit number, the result rolls back around to a tiny value.

Toy example with smaller numbers, so it's intuitive. Imagine 8-bit math (numbers 0 to 255). If `target = 250` and `len = 10`, then `target + len = 260`. There is no 260 in 8-bit world; the result wraps to `4`. A naive bounds check looks at `4`, says "well, 4 is comfortably inside the array", and lets the write proceed. But the *actual* write goes from 250 onward, all the way through wraparound, scribbling past the end.

64-bit pointers do exactly the same thing, just with vastly larger numbers. Here's the real values from the bug:

```
     attacker passes:
     target = 0xfffffe00_abcd1000        ← address inside attacker's own slot
     len    = 0xffff_ffff_ffff_fe00      ← huge

     target + len  =  0xfffffe00_abcd0e00   ← wrapped! sits BELOW target!
                          ▲
                          │
            pre-patch check uses this "end" address.
            Because it's below target (instead of above),
            it sneaks past the < ro_zone_hi comparison.
            check passes ✓

     then memcpy runs with real `len`:

          ┌──── validated slot ────┐
          ▼                        ▼
     ┌─────────┬─────────┬─────────┬─────────┬─────────┐
     │ atk's   │ atk's   │ victim  │ victim  │ next    │
     │ ucred   │ ucred   │ ucred   │ ucred   │ slot    │
     └─────────┴─────────┴─────────┴─────────┴─────────┘
          ▲                        ▲                  ▲
          └────── target ──────────┘                  │
          └──────────── len bytes copied ─────────────┘
                                   │
                          attacker bytes spill into
                          victim's ucred → cr_uid = 0
```

The pre-patch check looked at the wrapped `target+len` (a tiny number, comfortably below the RO zone's upper limit), said "looks fine to me", and authorised the write. Then `memcpy` ran with the *real* `len`, which is huge. The bytes flowed out of the validated slot and into whatever was next door.

What's next door? Almost certainly another `ucred`, because RO-zone slots of the same type get packed adjacent to each other. The attacker controls the bytes being copied (the `src` argument), so they pick a payload that places four bytes of `0x00000000` at exactly the offset where a victim's `cr_uid` lives. The kernel writes those bytes through its own trusted writer. The next time it checks credentials on the victim process, the process is root. The attacker arranges to *be* that process and the chain is done.

Cue evil laugh.

### The fix, in two instructions

I pulled both the 26.4.1 and 26.5 kernelcaches off my research box and diffed `_zalloc_ro_mut` instruction by instruction. The function went from 114 instructions to 116. Three real changes:

1. **The overflow check moved earlier.** Pre-patch, the `adds x9, x8, x4; b.hs` sequence ran *after* an unrelated stack-overlap check, so the wrap-handling fall-through path entered the range comparison with an already-wrapped value. Post-patch, the overflow detection is the first thing that happens. If it wraps, you go nowhere useful.

2. **A per-CPU bound was added** via the `TPIDR_EL1` register (ARM64's per-core thread pointer). Pre-patch, the bounds check used the *global* RO-zone range. Post-patch, the destination must also fit inside the *current CPU's* RO sub-zone. The kernel maintains separate read-only sub-zones per core for performance, and the old code didn't enforce that boundary.

3. **A useless stack-overlap check was removed.** Vestigial code that compared the destination against the frame pointer. Mostly never fired. Gone.

Here's the actual diff. Pre-patch arm64e:

```asm
; macOS 26.4.1, _zalloc_ro_mut at 0xfffffe000b4e3560
cmp   x8, x29              ; stack-frame sanity check (useless)
b.lo  skip_stack_check
; ... 6 instructions of alignment-mask arithmetic ...
adds  x9, x8, x4           ; HERE, late: target+len
b.hs  range_check
; overflow falls through into range check with x9 wrapped
```

Post-patch:

```asm
; macOS 26.5, _zalloc_ro_mut at 0xfffffe000b4e84d0
mrs   x10, TPIDR_EL1       ; per-CPU pointer
adds  x9, x8, x4           ; HERE, first: target+len
b.hs  per_cpu_check
ldr   x11, [x10, #0x158]   ; per-CPU bound marker
ldr   x10, [x10, #0xe8]    ; per-CPU RO subzone base
sub   x12, x10, #0x4000    ; base − 16 KB
cmp   x11, #0x0
csel  x11, x10, x12, eq
adrp  x12, ...
ldr   x12, [x12, #0x530]
add   x10, x12, x10
cmp   x8, x11
ccmp  x9, x11, #0x0, hs    ; NEW: target+len vs per-CPU lower
ccmp  x9, x10, #0x2, hs    ; NEW: target+len vs per-CPU upper
b.ls  panic
```

Yes, this is what `+2 instructions` looks like once you re-arrange everything around them.

### So how does this *bypass* MIE?

This is the bit that surprises people. *None of MIE's pieces fire.*

- **EMTE doesn't fire** because the writer (`_zalloc_ro_mut`) holds the correct tag for the RO zone. The bytes go in with a matching tag.
- **The Secure Page Table Monitor doesn't fire** because the page is being marked writable by the *authorised* function. SPTM only refuses unauthorised mark-writable transitions.
- **The hardware page tables don't fire** because the page is briefly writable for exactly this purpose.

Every protection performs *exactly as designed*. The bug is upstream of all of them. It's in the argument validation of the one function that everything else trusts to write to the RO zone. The protections are gatekeepers and the bug is a forged badge that the gatekeepers wave through.

This is what *data-only* exploitation looks like in 2026. MIE was built to stop pointer corruption: forged pointers, torn pointers, dangling pointers. It doesn't have an opinion about an authorised writer choosing the wrong slot. The more memory tagging covers, the more exploit research will pile up on top of these trusted writers, because they're the only door left.

### How the chain actually works

Calif say "two vulnerabilities and several techniques." Only CVE-2026-28952 is publicly attributed to them; the rest stays embargoed until their 55-page report drops. But the constraints they published are narrow enough to reconstruct the shape with reasonable confidence. Unprivileged user. Public syscalls only. Ends in root shell.

Here's how I'd build it, given the patch and the constraints.

#### Reaching `_zalloc_ro_mut` from userland

You don't call it directly; it's internal. You reach it through a public syscall whose kernel-side implementation writes into an RO-zone slot. Candidates:

- **`setuid` / `seteuid` / `setresuid`** triggers `kauth_cred_setresuid`, which builds a new `ucred` and stores it via `_zalloc_ro_mut`. The arg is a 4-byte `uid_t`, too small to wrap. Good for *triggering* allocations, not for the overflow itself.
- **`posix_spawn` with credential-attribute structures.** Spawn-attribute parsing copies user buffers into the new process's slots. Worth reverse-engineering if nothing else fits.
- **`csops_audittoken(pid, ops, useraddr, usersize, audit_token)`.** The spicy one. `usersize` is 64 bits and attacker-controlled. Several `ops` codes flow user data into the target process's RO-zone codesigning slot. If `usersize` reaches `_zalloc_ro_mut`'s `len` without a wrap-safe check on the way, that's your primitive.
- **`mac_set_proc` / `mac_set_fd` / `mac_set_link`.** MAC labels live in RO-zone slots, written from user-supplied buffers with user-supplied sizes. Same pattern as csops.

My money is on `csops_audittoken` or one of the `mac_set_*` calls. Both are unprivileged. Both have user-controlled sizes flowing the right way.

#### Heap shaping

RO-zone slots are segmented by struct type, so all `ucred` slots live next to each other in their own sub-zone. To land the spill on a specific victim:

1. Spam `fork()` to allocate a bunch of attacker-owned `ucred` slots.
2. Exit some children to free their slots and create predictable holes.
3. Repeat until the next allocation lands adjacent to a process you can later become.

macOS RO-zone allocators randomise slot order within their freelists, so this needs either many re-rolls or a separate info leak that reveals the actual addresses. Almost certainly the latter.

#### The info leak

26.5 also patched a family of unauthenticated pointer-chain bugs across `_thread_set_allocation_name`, `_thread_set_thread_name` and siblings. Apple retrofitted a PAC `autda` check with discriminator `0x6d42` on every dereference in the family. Reachable from unprivileged processes via `pthread_setname_np` and the Mach thread APIs. Pre-patch, walking the chain leaked raw kernel pointers that let you derive the RO-zone slide and locate a specific slot.

None of those CVEs (CVE-2026-28897, -28987, -28943) are publicly credited to Calif. But the patch timing fits, and the chain needs *something* like this to be deterministic. Either Calif used one of these and Apple chose not to share credit, or there's another leak we haven't identified yet.

#### Putting it together

So the chain plausibly looks like:

1. Spawn many child processes to seed the RO zone with predictable `ucred` allocations.
2. Use the thread-name info leak to disclose a kernel pointer and derive the slide.
3. Call `csops_audittoken` (or `mac_set_*`) with a `usersize` chosen so that `target + len` wraps inside `_zalloc_ro_mut`.
4. The pre-patch bounds check accepts the wrapped end, marks the page writable, `memcpy` runs.
5. The spill overwrites a neighbouring `ucred`'s `cr_uid` with `0`.
6. The attacker becomes that process (their own child, by setup) and runs the shell as root.

Informed speculation, to be clear. Calif may have used a different reach (Mach IPC, IOKit, sockets) or a different leak. But the *shape* of the chain is constrained by what they published, and this shape fits. We'll know for sure when the 55-page report ships.

### Cross-platform reach

The fix shipped to **five** OS versions on the same day:

- iOS 18.7.9
- iPadOS 18.7.9
- macOS Sequoia 15.7.7
- macOS Sonoma 14.8.7
- macOS Tahoe 26.5

The RO-zone allocator was introduced in Sonoma and iOS 17 *three years ago*. The bug has been sitting there the whole time. On M5/A19 it's specifically a MIE bypass. On older Apple Silicon (everything before M5/A19) it's "merely" an out-of-bounds write on a `ucred`-bearing allocator, which is itself an excellent local privilege-escalation primitive. The exploit pattern back-ports cleanly across the whole Apple-Silicon lineup.

### Is this fixed for good?

Short answer: *no*. The patch closes this specific bug. It does not close the bug *class*.

The 26.5 fix does three things, all scoped to `_zalloc_ro_mut`:

- The overflow check runs earlier in the function.
- A per-CPU bound is added.
- A vestigial stack-overlap check is removed.

What it explicitly does *not* do:

- Add the per-CPU bound to other writers that touch RO-zone state. The atomic sibling `_zalloc_ro_mut_atomic`, the codesigning-flag mutators, the sandbox-slot updaters, the AMFI provisioning-profile writers, the IPC port-rights updaters: all of these still rely on whatever validation they had before. None of them got the structural change.
- Add canaries between RO-zone slots. A few unused bytes with a known value between each slot would have caught this exact overflow: the spill clobbers the canary, the next allocator check notices, the kernel panics instead of running with corrupted credentials. RO zones aren't memory-pressured the way the general heap is, so the cost is small. Apple didn't take it.
- Change the API shape. `_zalloc_ro_mut` still accepts a raw caller-supplied `target` pointer. A defensive redesign would take an opaque slot handle that the function resolves internally, so the bounds-check inputs aren't computed by callers. Apple didn't do that either.

So the structural assumption hasn't changed: the trusted writer's argument validation is still the only thing between user-influenced inputs and the kernel's crown jewels. Apple closed the *door* the attackers walked through. They didn't move the *gate*.

What does that mean in practice? More MIE bypass bugs of this exact shape, almost certainly. Every RO-zone writer is a candidate. Every place where caller-supplied arithmetic flows into a bounds check is a candidate. The 55-page report from Calif will publish techniques other researchers can replicate, and history says variants don't take long to surface once the technique is out.

The good news, such as it is: each one of these costs five days now instead of five years. Apple's patch cadence is what defends you, not the architecture. Keep your devices updated.

### For defenders

If you run Apple devices for a living, the takeaways are practical.

- **Patch and verify.** Don't trust the auto-update wave. Use your MDM to check build numbers device-by-device. The bug existed for three years and will be republished in detail soon. Copycats will follow within days.
- **Inventory M5 / A19 first.** Those are the headline-grabbing devices. The same bug exists on older Apple Silicon, just without the MIE-bypass framing.
- **This is local privesc, not RCE.** The attacker has to already be running code as your user. That means your detection budget belongs on **initial access**, not post-exploit. Hard truth: by the time this bug fires, you have seconds before your endpoint agent is talking to a kernel that lies to it.
- **Post-exploit detection is essentially impossible on-host.** The exploit leaves no broken pointers, no kernel logs out of the ordinary. Your `ucred` quietly flips and the kernel believes it. Detection has to happen at the *behaviour* layer: a process that was uid=501 suddenly doing things only root can. Existing telemetry on `setuid`-class syscalls and on shells spawning with mismatched euid is your friend.
- **Don't retire defence-in-depth.** Apple marketed MIE as a generational leap, and they weren't wrong, but it doesn't absolve the rest of your stack. Endpoint logging, app allow-listing, Lockdown Mode for high-risk users, MDM-enforced profiles. MIE raises the cost of an exploit. It doesn't eliminate the need for the rest.
- **Lockdown Mode for executives, journalists, activists.** It doesn't close *this* bug, but it slams the door on the practical initial-access vectors that get attackers into the local-code position they need.
- **Watch for the 55-page report.** When Calif publish their full writeup, two things happen. Every kernel researcher reads it and starts hunting siblings of the bug in other privileged writers. Exploit kits incorporate the public details within weeks. Update your threat model accordingly.

### For exploit writers

If you do offence for a living, this disclosure is full of signal.

- **Tag-based memory safety doesn't kill the kernel exploit. It moves it.** EMTE pushes exploit research out of "corrupt the pointer" into "abuse the authorised writer". The new frontier is the access-control logic of the small set of kernel functions that hold the keys to protected zones. Internalise it.
- **Integer overflow never really left.** This bug is a textbook overflow in a bounds check that was *meant to be defensive*. The function had an overflow guard. It ran in the wrong order. Audit bounds-check sequences in any privileged-writer function for the order of operations between the arithmetic and the comparison. If the comparison sees a wrapped value before the overflow check fires, you have a candidate.
- **Hunt sibling writers.** `_zalloc_ro_mut` isn't the only function with RO-zone-mutate capability. Look at zone-resize paths, the atomic variant `_zalloc_ro_mut_atomic`, codesigning-flag mutators, sandbox-slot updaters, AMFI provisioning-profile writers, IPC port-rights updaters. Apple added per-CPU bounds to *one* of them in 26.5. Maybe not all the others.
- **The 26.5 diff is a treasure map.** Other patched functions in the same release include `_task_resume` / `_task_suspend` (CVE-2026-28951, Csaba Fitzl) and a family of PAC-authentication additions on thread-name / qlimit / allocation-name paths (CVE-2026-28897 / -28987 / -28943). Each represents a closed primitive in 26.5 and an open primitive in 26.4.1 and earlier. If you have a 26.4.1 box, you have a window.
- **Cross-version variants are worth a look.** The bug sat in Sonoma 14.8.6, Sequoia 15.7.6, Tahoe 26.4.1, iOS 18.7.8, iPadOS 18.7.8 simultaneously. The wrap is identical across all of them. Old fleets that haven't patched are exploitable today.
- **Heap shaping is the unsung skill.** Calif's chain needed to land the spill on a useful target slot. That's the "technique" piece. Spend time on RO-zone shaping primitives: which syscalls allocate and free slots in which zone, in what order. The few people who become fluent at this will own the next decade of Apple Silicon LPE research.
- **AI is a useful accelerator. Not a magic wand.** Calif used Mythos Preview throughout and were explicit that the model didn't invent the bug class. It recognised a class the team had already generalised from prior work, helped iterate exploit code, and saved time. Every serious exploit team will integrate an AI assistant the same way they integrate IDA, Ghidra, and a fuzzer. The teams that don't will be slower. The teams that do will still need humans for the hard creative work.
- **The bug-to-exploit pipeline is now days, not months.** Five days from "no bugs in hand" to root shell on an MIE-protected M5 is a remarkable number even with AI help. Apple's response cadence has to assume this is the new baseline. So does yours.

### What I'd do if I were Apple

Three small ideas, because criticism without suggestions is just whining.

1. **Per-CPU bounds for every RO-zone writer**, not just `_zalloc_ro_mut`. There aren't that many. The audit is mechanical.
2. **Canaries between slots.** Even one cacheline of unused bytes with a known constant between each slot would have caught this bug: spill past the end → canary clobbered → next allocator check notices. RO zones aren't memory-pressured the way the general kalloc heap is. Spend the bytes.
3. **Opaque slot handles instead of raw pointers.** The `_zalloc_ro_mut` API currently takes a `target` pointer the caller computed itself. A more defensive design takes an opaque handle that the function resolves internally, with no caller-supplied arithmetic between handle and destination. Raises the bar for getting attacker-controlled arithmetic into the bounds-check inputs.

None of this is revolutionary. All of it follows from "the trusted writer is now the highest-value attack surface in the kernel, treat it accordingly."

### Takeaways

MIE is a real improvement. EMTE stops most pointer corruption, the RO zone keeps the crown jewels behind a hardware gate, and the Secure Page Table Monitor enforces that only one function can open it. All of that did its job. None of it caught Calif.

The bug was in the one place MIE *can't* protect: the argument validation of the trusted writer itself. An integer overflow in `_zalloc_ro_mut` let attacker bytes spill across slot boundaries inside the RO zone. The bytes landed on a `ucred`. The `cr_uid` flipped to zero. Root shell. The pointer was never bad, the page table was never wrong, the tag was always correct.

Two lessons.

The first is for Apple, and they already learned it: the trusted writer is now the highest-value attack surface in the kernel. Treat its inputs like you'd treat inputs from the network.

The second is for the rest of us. Every protection layer relies on the assumption that the layer below it has been validated. Once you start stacking defences, the gaps move *between* them, into the validation glue. As Apple keeps tightening memory tagging on the platform, expect more of these bugs, not fewer. They'll all look like this one: small, defensive code that was meant to keep us safe, doing its arithmetic in the wrong order.

Patch your stuff. Watch for the 55-page report. And the next time someone tells you a memory-safety mitigation is "unbypassable", remember it took three people and an AI five days to walk through this one. Score on the board: bug hunters 1, five years of silicon 0. For now.

### Sources and further reading

The reverse-engineering work in this post is mine, off pre-patch and post-patch kernelcaches I had on disk for an unrelated research project. The credit for the original bug discovery and the bypass design belongs entirely to Calif and the Anthropic Mythos team.

- [Calif's announcement](https://blog.calif.io/p/first-public-kernel-memory-corruption): the canonical source.
- [Apple's security notes for macOS Tahoe 26.5](https://support.apple.com/en-us/127115): the CVE list with credits.
- [NVD CVE-2026-28952](https://nvd.nist.gov/vuln/detail/CVE-2026-28952): confirms the "integer overflow" classification.
- [Apple's MIE architecture writeup](https://security.apple.com/blog/memory-integrity-enforcement/): Apple's own marketing-but-technical explainer.
- [8kSec's MIE kernel deep-dive](https://8ksec.io/mie-deep-dive-kernel/): independent third-party walkthrough.
- [GBHackers writeup of CVE-2025-24118](https://gbhackers.com/apples-macos-vulnerability/): background on the same function's *previous* CVE in January 2025 (a race condition rather than this overflow).
- XNU source for `ucred` and related structures: [apple-oss-distributions/xnu](https://github.com/apple-oss-distributions/xnu) on GitHub.

The 55-page report will, when it lands, give you the second vulnerability, the heap-shaping technique, and the exact path through normal syscalls. Everything above is my reconstruction from the patch and public disclosures. The report will be ground truth.

Now go install your update, fool. ;-)
