+++
date = "2026-09-26T00:00:00+02:00"
title = "EX-ARRR: Sailing the 0-click Seas"
tags = ["apple","macos","ios","imageio","exr","imessage","blastdoor","0-click","exploit","cve-2026-86869","fuzzing","llm","heap","memory-safety"]
description = "How an LLM-guided fuzzing lead turned into a zero-click iMessage trigger that fires before you ever open the message. Apple shipped the fix as CVE-2026-86869 across iOS, iPadOS, and macOS 27. Enjoy my full voyage."
layout = "blog"
draft = false
+++

**Every serious Apple device compromise of the last decade has a boring secret at the bottom of it: a parser read a file and trusted it a little too much. Not a phishing link, not a stolen password. A daemon you never launched, decoding a file you never opened, one byte past the end of a buffer. This is that story. It starts late one evening with a fuzzer that did not know what an EXR file was, and ends with a heap overflow that fires inside a privileged Apple daemon the instant an iMessage lands evading BlastDoor's, before the little notification banner even finishes sliding in. No tap required. Zero clicks. Grab a mug, this one is my first 0-click voyage.**
    
TL;DR:

- [Why 0-click is the whole game](#why-0-click-is-the-whole-game)
- [The bug in 60 seconds](#the-bug-in-60-seconds)
- [It started with a fuzzer that did not know what EXR was](#it-started-with-a-fuzzer-that-did-not-know-what-exr-was)
- [Reading the wreckage](#reading-the-wreckage)
- [A test rig made of AppleScript and stubbornness](#a-test-rig-made-of-applescript-and-stubbornness)
- [From "it crashes" to "I own the bytes"](#from-it-crashes-to-i-own-the-bytes)
- [Off the bench, onto a real iPad](#off-the-bench-onto-a-real-ipad)
- [Zero clicks](#zero-clicks)
- [How bad is it, honestly](#how-bad-is-it-honestly)
- [For defenders](#for-defenders)
- [For bug hunters](#for-bug-hunters)
- [Disclosure timeline](#disclosure-timeline)
- [Takeaways](#takeaways)

### Why 0-click is the whole game

There is a hierarchy of scary in offensive security, and it is measured in clicks.

A bug that needs the victim to download an app, run it, and click through three warnings is worth very little. A bug that needs them to open an attachment is worth more. A bug that needs them to *tap a link* is getting spicy. And then there is the top of the mountain: the bug that needs the victim to do nothing at all. It arrives. The device processes it because that is the device's job. It fires. This is what the industry calls a zero-click, and it is the class of bug that put Pegasus on journalists' phones and kept it there.

The reason 0-click is so prized is that modern phones do an enormous amount of work on your behalf, automatically, the moment content arrives. A photo shows up in Messages and the OS wants to show you a thumbnail, so it decodes the image. It wants to index it for search, so it decodes it again. It wants to know if it is a screenshot, a receipt, a face, so it hands it to a few more analysis pipelines. Every one of those steps is a parser touching attacker-controlled bytes, running in a daemon with more privilege than the sandboxed app that received the file. You did not open anything. The machinery opened it for you.

So the hunt for a 0-click is really a hunt for two things at once. First, a memory-safety bug in a parser. Second, a path that reaches that parser without the human in the loop. Plenty of people find the first and never find the second. The whole point of this write-up is that I found both, in a format almost nobody thinks about: OpenEXR.

EXR is a high-dynamic-range image format from the visual-effects world. It stores light as 32-bit floats, it supports arbitrary channels, and it is exactly the kind of niche, high-complexity, low-scrutiny format that hides good bugs. Apple ships its own decoder for it, `libAppleEXR.dylib`, wired into ImageIO, which means it sits behind the same `CGImageSource` funnel that decodes basically every image on the platform. If EXR decodes there, EXR decodes everywhere ImageIO is asked to open an image. Hold that thought.

### The bug in 60 seconds

Here is the whole bug up front.

Apple's EXR decoder allocates a destination buffer sized for a three-channel RGB image. Twelve bytes per pixel: red, green, blue, each a 32-bit float, four bytes each. Reasonable, the file said RGB, no alpha.

Then it calls an interleave routine to fill that buffer, and the interleave routine writes *four* channels per pixel. Sixteen bytes: red, green, blue, and a hardcoded alpha of `1.0`. Every pixel it writes is four bytes bigger than the space that was reserved for it.

That is the whole thing. The allocator was told twelve, the writer does sixteen. Four bytes of overrun per pixel, and it accumulates, row after row, for the entire image. At a modest 448 by 448 pixels that is roughly **800 kilobytes** of heap written straight past the end of an 800-kilobyte-ish allocation, into whatever the allocator handed out next.

```c
// what the allocator was told (paraphrased from EXRReadPlugin::decodeBlockAppleEXR)
size_t bytes_per_pixel = channels * sizeof(float);   // channels == 3  ->  12
dst = malloc(bytes_per_pixel * width * height);       // sized for RGB

// what the writer actually does (CompressedInterleave4<uint,1,1,1,0>)
// emits R, G, B, and a constant alpha lane, 4 floats == 16 bytes per pixel
// 16 > 12, forever, for every pixel in the image
```

And the sweetener, the thing that turns this from a crash into a weapon: twelve of those sixteen written bytes are the red, green, and blue values straight out of the file's pixel data. Attacker controlled. Only the four-byte alpha lane is fixed, that constant `1.0` float, which in memory is `0x3f800000`. So it is not just an overflow. It is an overflow where three quarters of every overwritten word is a value I chose.

The rest of this post is how I went from "a fuzzer emitted a weird crash" to "I can steer that 800 kilobytes, on a real device, with zero taps."

### It started with a fuzzer that did not know what EXR was

I did not sit down one morning and decide to audit the EXR decoder. Nobody does. Well, unless you're me, apparently. You get there sideways.

My hunting setup leans hard on LLM-guided fuzzing. The short version is that instead of throwing random bytes at a parser and praying, I have models read the disassembly of a target leaf, describe which fields it trusts, and propose mutations that keep the file *structurally valid* while poking exactly the counts, sizes, and type tags the code branches on. Random fuzzing of a format like EXR gets you nowhere, because the decoder rejects malformed files in the first hundred bytes and you never reach the interesting code. Structure-preserving, disassembly-anchored fuzzing gets you deep.

The first artifact was not a bug. It was static evidence. A model chewing through `libAppleEXR.dylib` flagged a mismatch it could see purely from the code: an allocation sized from a channel count, and a nearby SIMD store loop whose stride did not match that channel count. That is not a crash. That is a *hypothesis*, and static hypotheses are wrong all the time. Compilers do surprising things. Buffers get resized upstream. The path might be unreachable. I have a hard rule, learned the expensive way, that a static asymmetry is a lead and nothing more until something actually falls over at runtime.

But it was a good lead, because the shape of it was the oldest bug in graphics: a channel-count confusion. RGB going in, RGBA coming out. So I built the smallest possible EXR file that would drive the suspect path, a 448 by 448 image with three float channels and ZIP compression, fed it through a one-line harness that just asks ImageIO to decode it, and watched.

It crashed.

```
$ ./decode test_marker_448x448.exr
Segmentation fault: 11
```

A segfault is not a vulnerability. A segfault is an invitation. Time to read the wreckage.

### Reading the wreckage

The crash report put the fault in exactly the function the model had fingered, with a name only a template could love:

```
CompressedInterleave4<unsigned int, 1, 1, 1, 0>+452
```

The faulting instruction is a single ARM NEON store:

```asm
; the overwrite, one instruction
st2.4s  { v3, v4 }, [x17], #32     ; interleaved store, 32 bytes, post-increment x17
```

`st2.4s` is a two-register, four-lane, 32-bit interleaved store. In plain terms: it takes two vector registers, weaves their lanes together, and writes 32 bytes to wherever `x17` points, then bumps `x17` forward by 32 for the next go. `x17` is the write cursor walking across the destination buffer. The loop keeps stepping it forward, 32 bytes at a time, packing four-channel pixels, right off the end of the twelve-byte-per-pixel allocation and into the next region of the heap.

I pulled the whole loop apart to make sure I understood what was being written and, just as importantly, what was *not*:

- Three input streams get read with `ldr` from the decompressed R, G, and B planes. Those are the file's pixel values.
- The fourth lane is loaded from a constant, that `0x3f800000` alpha sentinel, the float `1.0`.
- The lanes get woven with `zip` and narrowed with `xtn`, then stored with `st2.4s`.
- Crucially, there is no `ld2` reading adjacent heap, no leak. This is a pure *write* primitive. It never reads the neighbour, it only clobbers it.

That last point mattered a lot later, and it is the kind of thing you only learn by reading the actual instructions instead of trusting the crash summary. A write-only primitive changes which exploitation strategies are even on the table.

The fault address in the crash report sat exactly one byte past the end of a mapped region. Not a null-pointer deref, not a wild read, a clean walk off the end of a real allocation. The decoder had genuinely sized the buffer for three channels and genuinely written four. The static hypothesis was now a runtime fact.

One fact, though, is a party trick. I needed to know two things before this was worth anyone's time. Could I *control* where those bytes landed and what they were? And could I reach this decoder without a human politely double-clicking my file? For the first question, I needed to stop crashing and start experimenting, which meant I needed to run this hundreds of times without going insane.

### A test rig made of AppleScript and stubbornness

Here is the unglamorous middle of every exploit story.

To learn how a heap overflow behaves you have to trigger it over and over, under slightly different conditions each time, and observe what changed. Different image dimensions push the overflow different distances. Different pixel values change the bytes written. Different allocation patterns beforehand change what is sitting next door to get clobbered. You are running a science experiment where the lab equipment keeps segfaulting on purpose.

I wanted this loop as tight and as *realistic* as possible. Testing inside a hand-rolled harness is fine for the mechanics, but harnesses lie. A harness runs at the wrong privilege, with the wrong allocator state, in the wrong process. The bug that matters is the bug as the real system triggers it. So I drove the real applications, and the glue that let me do that on macOS was AppleScript.

AppleScript is a wonderful, ridiculous tool for exactly this. It let me script the actual OS into ingesting my files the way it would ingest a real one: drop a crafted EXR into the pipeline, tell the real Photos application to import it, let the real decode path run, harvest whatever crash report fell out, tweak one parameter, repeat. A loop like this, conceptually:

```applescript
-- drive the real ingest path, not a toy harness, and collect what falls out
repeat with variant in craftedImages
    tell application "Photos" to import (variant as POSIX file)
    delay 2
    -- scoop any fresh crash report the decode produced, tag it with the input, reset, go again
end repeat
```

Round and round, for hours. Craft, feed, observe, adjust. Each iteration taught me a little more about the shape of the hole: how far a given image size reached, which regions of the heap I could land in, how deterministic the landing was. This is the "kept pushing" part of the story, and it is mostly patience. The bug does not hand you control. You map its behaviour one boring iteration at a time until a picture forms.

And a picture did form. Two of them, actually, and the second was the one that made me sit up.

### From "it crashes" to "I own the bytes"

The first picture was about steering, and it came from the heap. If you allocate a big pile of same-sized objects, free every other one to open predictable gaps, and *then* trigger an allocation-plus-overflow, the overflow lands in a slot whose neighbour you placed on purpose. Classic heap grooming. With the destination buffer size pinned by the image dimensions, and the neighbour placed by hand, the landing became deterministic. Same slot, every single run. The overflow stopped being a random act of vandalism and became a controlled write into a place I chose.

Then I checked what I could actually write there, and this is where a plain overflow became a genuinely nasty one. I built a set of EXR files identical except for their pixel values, decoded each, and read back the bytes that had spilled into the neighbouring object. They tracked my input. Feed a pixel value in, watch a corresponding byte appear in the clobbered neighbour. The relationship runs through the decoder's tone-mapping math, so it is not a raw copy, but it is a stable, invertible mapping: pick the byte you want in the victim, work backwards to the pixel value that produces it, put that value in the file.

The write is not perfectly arbitrary. That fixed alpha lane, the `0x3f800000`, lands at a predictable offset in every clobbered pixel and I do not get to change it. But three of every four bytes are mine. For an attacker, three-quarters attacker-controlled, with a deterministic landing position, is not a limitation worth complaining about. It is a primitive.

And there was a second way in that widened the blast radius. It is not just the "show me a thumbnail" path that decodes with the vulnerable option set. Any pipeline that *converts* an EXR while asking for the same standard-dynamic-range output triggers it too. Open the file, ask for a PNG or a JPEG out the other side, and the decode runs through the same overflowing routine on the way. That is a huge surface. Conversion happens constantly and invisibly on a modern OS.

Which brought me back to the question that actually determines whether any of this matters. All of this was still, technically, me feeding files to my own machine. Anyone can crash their own computer. Who else feeds this decoder, and can I reach them without asking?

### Off the bench, onto a real iPad

The honest way to answer "is this actually reachable" is to stop testing on the machine you develop on, because your dev machine is contaminated. It has your tooling, your relaxed settings (SIP off, anyone?), your muscle memory. The bug that matters is the bug on a stock device that belongs to a normal person and has never heard of you. The real victim.

So I set up a clean, external iPad as the victim. Nothing special on it. Signed into a fresh iCloud account, default settings, the configuration a real target would have. From that point on, the only things allowed to touch that device were the things a remote attacker could actually send it. If I could make the bug fire over there, using only channels an attacker controls, then it was real. If I could only make it fire by fiddling with the iPad directly, it was a lab curiosity.

![A stock external iPad wired up as the victim device on my desk](/img/ex-arrr/desk.png)

*The messy rig. One poor iPad on a stand, my trusty old Cynthion, and a glass of something that went cold while it crashed for me, over and over.*

The first milestone on the real device was almost anticlimactic and completely thrilling: the decoder fired on files that arrived through ordinary means, not just files I hand-placed. The system's own image machinery, doing its normal automatic work on incoming content, walked straight into the overflow. The crash reports that came off that device were not in my harness. They were in Apple's own processes, faulting in `CompressedInterleave4`, at that same `+452` offset, with the fault address one byte past a real heap region. The exact signature from the very first bench crash, now happening inside a trusted system component on a device I was only ever *sending things to*.

That is the moment a lead becomes a vulnerability. Not when it crashes on your desk. When it crashes on someone else's device because of something you sent.

Now for the last and best question. What is the least the victim can do and still get hit? Because "arrives through ordinary means" still might mean they tapped something. I wanted zero.

### Zero clicks

Here is the chain that removes the human entirely.

When an iMessage arrives with an attachment, a whole assembly line springs into motion before you have decided whether to even look at the conversation. The message is received and its attachment written to disk. The system indexes it so it will show up in search. Part of that indexing hands the content to the photo subsystem, which wants to catalogue and prepare any media it sees, including generating thumbnails and derivative images so the photo library stays fast and searchable.

That thumbnail-generation step is the trap. Deep in the photo library's background sanitation worker, the code that prepares derivatives for incoming syndicated content builds its image-decode request with the standard-dynamic-range option hardcoded on. Not conditionally. Unconditionally. The exact option that flips the EXR decoder into the four-channel-writing, buffer-overrunning path. So the sequence is:

1. An iMessage with an EXR attachment arrives. The attachment is written to disk.
2. The persistence and indexing machinery ingests it and forwards it to the photo subsystem.
3. A background worker, running to keep your photo library tidy, decides to generate derivative images for the new content.
4. It builds a decode request with the SDR option hardcoded on.
5. ImageIO routes the EXR to `libAppleEXR`, which reports that yes, it can satisfy that request, and runs the decode.
6. `CompressedInterleave4` writes sixteen bytes per pixel into a twelve-byte-per-pixel buffer, inside that privileged background daemon.

Nobody opened the Messages app. Nobody tapped the attachment. Nobody even looked at the notification. The overflow fired because the OS, doing exactly what it is designed to do with incoming content, decoded a file on the victim's behalf, in a process with far more reach than the sandbox that received it. 

The proof that this is genuinely no-interaction was sitting in the crash reports the whole time. Several of the on-device crashes were tagged as happening in *background* processing, in the syndication and import machinery, at moments when nothing was in the foreground and no human was touching the device. Background-mode crashes in the decode path are the receipt. The machinery triggered it, not the user.

You might be wondering about BlastDoor. Apple built it precisely to stop this: a locked-down sandbox that chews on untrusted iMessage content well away from anything valuable, bolted on after the last generation of 0-click attachment bugs. So why did this sail straight past it? Two reasons. EXR is not on BlastDoor's list of handled types, so BlastDoor never decodes the file. And the decode that matters does not happen in the message-parsing path at all. It happens later, in a different daemon, when the saved attachment gets indexed for search and the photo library quietly generates its thumbnails. BlastDoor guards the front door. This one walks in through the side door marked Spotlight.

That is a zero-click reach into a privileged Apple daemon, from an attachment, over iMessage, across the internet.

And this is not a macOS-only story. `libAppleEXR` and ImageIO are the same code on iOS, iPadOS, and macOS, compiled from the same source for the same arm64e silicon. The `CGImageSource` funnel is identical, the SDR-decode option is identical, and the photo-library thumbnail and syndication machinery that decodes incoming attachments exists on all three. The reproduction in this post happened to be driven on a Mac and confirmed on an iPad, but the vulnerable instruction and its zero-click reach are cross-platform. The same crafted attachment fires the same overflow whether it lands on an iPhone, an iPad, or a Mac.

### How bad is it, honestly

Now the honest part. Inflated severity is how you lose the trust of the people you report to, and how you lose your own bearings.

What I have, provably, is a **controlled heap overflow that fires zero-click inside a privileged daemon**. Deterministic landing, three-quarters attacker-controlled bytes, reachable over iMessage with no interaction. That is a serious primitive on its own. It defeats the "you have to trick the user" assumption entirely.

Then I kept pushing, and the primitive got worse in the way that matters. The linear overflow at 448 pixels overshoots into unmapped guard pages, which is why the early crashes were clean segfaults. But shrink the craft so the destination lands in the small and tiny allocator zones, groom the neighbours into place, and the write stops being a blunt overrun and becomes a *write-what-where*: a byte written to an address I chose. The proof is unglamorous and total, a crash whose faulting address is `0x67e03bd12a4a594e`, which is not a heap pointer or a slide, it is a value I picked and steered the write to. That is an arbitrary write, not an overflow that happens to land somewhere.

From an arbitrary write, control of the program counter is the next rung, and in a controlled harness it fell reliably: adapt a function-pointer slot, trigger, and execution redirects where I aimed, 100 runs out of 100. So "can this reach code execution" is not a hand-wave. In the harness it *is* code execution.

The honest wrinkle is the jump from a harness to a real victim across a process boundary, and this is where modern Apple silicon earns its keep. Pointer Authentication signs the function pointers you would hijack, so you cannot forge a valid target out of thin air. Without a separate information leak to hand PAC to me, PAC holds and the clean unassisted cross-process break is a PITA. And there is a second mitigation doing real work: the privileged daemon in the 0-click path runs with hardware memory tagging enabled on the newest silicon, so on those chips the overflow trips a tag-check fault instead of silently corrupting. You won that round, M5. (MIE bypass, anyone?)

But, and this is the honest and uncomfortable other half: that same tagging is *not* enabled on the foreground Photos process, and the entire pre-latest-generation fleet has no such hardware tagging at all. On those enormous populations of devices, the write does not trip anything. It just happens. So "memory tagging catches it" is true for exactly one process on exactly the newest hardware, and false everywhere else that reaches the bug. The overflow also fires identically on hardware with tagging switched off entirely, same instruction, same fault class, which is the proof that the bug itself is parser-level and not saved by any silicon generation.

So the honest ceiling is: a zero-click, attacker-controlled write reaching a privileged daemon over iMessage, escalated to an arbitrary write and to harness-level program-counter control, with the last cross-process step gated by a PAC-signed pointer. Apple's triage classified the report as **0-click code execution via iMessage EXR image payload**, and shipped the fix.

### For defenders

A few concrete takeaways if you build or defend this kind of system.

**Your parsers run without you.** The scariest attack surface on any modern OS is not the code that runs when a user acts. It is the code that runs automatically on arriving content: thumbnailers, indexers, media analysers, preview generators. Inventory those paths. Every one of them is a parser eating hostile bytes at elevated privilege with no human gate.

**Niche formats are where bugs retire to.** Everybody has fuzzed JPEG and PNG into the ground. Nobody is looking at EXR, or the dozen other exotic formats a general-purpose image funnel quietly supports. Attack surface is defined by what the code *can* decode, not by what users normally send. If ImageIO can open it, it is in scope, and the obscure corners get the least scrutiny and hide the best bugs.

**The allocator and the writer must agree, and someone must enforce it.** This bug is one number in two places disagreeing: three channels at allocation time, four at write time. A single assertion that the write stride matches the allocated stride would have turned an 800-kilobyte overflow into a clean, safe abort. Defensive checks that tie the size a buffer was allocated with to the size it is written with are cheap and they catch exactly this family.

**A crash in a background daemon is a security event, not a stability blip.** Those background-mode crash reports were the loudest possible signal that untrusted content was reaching a sensitive decoder with no user in the loop. Telemetry that treats "the syndication worker segfaulted in an image decoder" as noise is throwing away the alarm.

### For bug hunters

And if you are on the offensive side of the fence, a couple of interesting takeaways;

**Static asymmetry is a lead, never a finding.** The channel-count mismatch was visible in the disassembly, but plenty of visible mismatches are unreachable, upstream-clamped, or compiled away. It is worth nothing until it falls over at runtime, in the real process, on a real target. Fall in love with the crash, not the hypothesis.

**Reach is half the bug, usually the harder half.** Finding the overflow took a day of reading assembly. Finding a no-interaction path to it took much longer and mattered far more. Anyone can crash a parser they feed by hand. The value is entirely in who *else* feeds it, and whether they do it without asking the victim. Budget your time accordingly, most people over-invest in the primitive and under-invest in the reach.

**Test in the real process and do not believe your results.** A harness will happily lie to you about allocator state, privilege, and reachability. The AppleScript rig that drove the actual system applications told me things no standalone binary ever could, because it exercised the genuine ingest path with the genuine heap next door.

**Claim exactly what you proved, and no less.** I reported a controlled zero-click overflow, then kept escalating it: an arbitrary write, then program-counter control in a harness, then cross-process control gated by a PAC-signed pointer I would still need to leak. Naming each rung precisely, including the one I did not clear cleanly, is more credible than either rounding up to "full RCE" or, just as bad, underselling it as "just a crash." Precision cuts both ways: do not inflate past what you ran, and do not fold a real primitive into a smaller word than it earned.

### Disclosure timeline

- **May 2026.** Bug identified via LLM-guided, disassembly-anchored fuzzing of `libAppleEXR`; runtime crash reproduced; controlled corruption and the zero-click iMessage reach demonstrated on a clean external device.
- **May 2026.** Reported to Apple Security with a full write-up, reproducer, crafted trigger files, and the on-device crash artifacts including the background-mode ones that prove no-interaction reach.
- **May and June 2026.** Follow-ups adding the cross-hardware confirmation (the bug fires identically on silicon with memory tagging off), the escalation from linear overflow to an attacker-chosen arbitrary write, and the harness-level program-counter control. Apple's triage classified the report as *0-click code execution via iMessage EXR image payload*.
- **September 2026.** Fixed across iOS, iPadOS, and macOS 27 (Golden Gate) as **CVE-2026-86869**.

The bug is patched on the latest releases, but the enormous fleet still sitting on older iOS, iPadOS, and macOS does not stop being vulnerable until each of those devices actually updates. Hence, this post deliberately keeps the file-crafting details and the heap-grooming recipe at the conceptual level.

### Takeaways

The whole voyage rhymes with every other great mobile compromise, and that is the lesson. It was not a clever social-engineering trick or a leaked credential. It was a parser reading a file and trusting a number. Three channels declared, four channels written, and the four-byte-per-pixel gap between those two facts opened into 800 kilobytes of controlled heap overwrite. The exotic format nobody audits, reached through the automatic machinery nobody watches, firing in the privileged daemon nobody expected to be in the blast radius, with zero taps from the person being attacked.

Memory-safety mitigations are real and they are getting better. Pointer Authentication genuinely raised the cost of turning this into code execution, and hardware memory tagging genuinely caught the write in the one place it was switched on. But mitigations protect the processes that opt into them, on the hardware that ships them, and the long tail of everything else is exactly where the bug still bites clean. A mitigation that covers one daemon on the newest silicon is not covering the fleet.

Start from the file. Follow it to the parser. Then, and this is the part that separates a crash from a compromise, follow the parser back to everyone who feeds it without asking. That last step is where the zero-clicks live.

Fair winds. Watch your attachments.

### Sources and further reading

- [OpenEXR file format](https://openexr.com/): the format specification, for the channel and compression model this bug lives in.
- [Apple ImageIO / CGImageSource](https://developer.apple.com/documentation/imageio): the decode funnel every image on the platform passes through, EXR included.
- [Google Project Zero](https://googleprojectzero.blogspot.com/): the canonical body of work on 0-click mobile bugs and why parsers-on-arriving-content are the crown-jewel surface.
- [Pardon MIE?](/blog/bypassing-apple-mie/): my earlier write-up on Apple's Memory Integrity Enforcement, for the memory-tagging and PAC context referenced above.
- [Crouching T2, Hidden Danger](/blog/crouching-t2-hidden-danger/): older Apple hardware-security work from the same family of "trust a little too much" bugs.
