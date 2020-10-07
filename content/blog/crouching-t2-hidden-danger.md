---
date: "2020-10-05T09:56:54+02:00"
title: "Crouching T2, Hidden Danger"
layout: "blog"
draft: false
---

**Let's talk about that thing nobody's talking about.
Let's talk about a vulnerability that's exposing 2018-2020 Macs while most are declining to act nor report about the matter.
Oh, and did I mention it's unpatchable?**

**Buckle up buckaroo, we're in for a wild ride.**

Skip to [#security-issues](#security-issues) for the technical mumbo-jumbo.

## Preface

### Attribution

The following post is an industry analysis of the code and research performed by [twitter.com/axi0mx](https://twitter.com/axi0mx/), [twitter.com/h0m3us3r](https://twitter.com/h0m3us3r/), [twitter.com/aunali1](https://twitter.com/aunali1/), [twitter.com/mcmrarm](https://twitter.com/mcmrarm/) and [twitter.com/su_rickmark](https://twitter.com/su_rickmark/) who poured endless hours of work into this, allowing companies and users to understand their risks concerning this issue.

### Intel vs Silicon

This blog post only applies to macOS systems with an Intel processor and the embedded T2 security chip.
Apple silicon systems will run completely on a set of Apple-designed ARM processors and mighth have a different topology, e.g. based on the A12.
Since the A12 chip seems to have fixed this issue (to be confirmed), it's highly likely the new Apple Silicon machines will not be vulnerable.
And while the new upcoming Intel Macs at the end of year will probably receive a new hardware revision of the T2 chip (e.g. based on the A12), we are still stuck with this vulnerability on Macs between 2018 and 2020.

### So about this T2 thing

In case you are using a recent macOS device, you are probably using [the embedded T2 security chip](https://support.apple.com/en-us/HT208862) which runs *bridgeOS* and is actually based on watchOS. This is a custom ARM processor designed by Apple based on the A10 CPU found in the iPhone 7.
The T2 chip contains a *Secure Enclave Processor* (SEP), much like the A-series processor in your iPhone will contain a SEP.

While newer Macs and/or Apple Silicon (including the dev kit) will use a more recent A-series processor such as the one found in the recent iPhone (A12), current Macs still use the A10.

It performs a predefined set of tasks for macOS such as audio processing, handling I/O, functioning as a [Hardware Security Module](https://en.wikipedia.org/wiki/Hardware_security_module) for e.g. Apple KeyChain or 2FA, hardware accelerating media playback, whitelisting kernel extensions, cryptographic operations and **ensuring the operating system you are booting is not tampered with**.
The T2 chip runs its own firmware called *bridgeOS*, which can be updated when you install a new macOS version. (ever notice the screen flickering? that's the display driver being interrupted and possibly updated.)

*Edit*: I first mentioned the iPad Pro to be impacted by the T2 vulnerability, but while it could suffer from the same vulnerability, it does not contain a T2 chip.


### The macOS boot sequence

So let's focus on the boot image verification on macOS. What exactly happens when you press that power button?
[There's also a visual representation for any *conaisseurs*](https://eclecticlightdotcom.files.wordpress.com/2018/08/bootprocess.png).
For the enthusiasts, I personally find [Booting Secure by mikeymikey](http://michaellynn.github.io/2018/07/27/booting-secure/) a more in-depth description.

0. The T2 chip is fully booted and stays on, even if your Mac device is shutdown.

1. The press of the power button or the opening of the lid triggers the System Management Controller (SMC) to boot.

2. The SMC performs a Power-On-Self-Test (POST) to detect any EFI or hardware issues such as bad RAM and possibly redirect to Recovery.

3. After those basic sanity checks, the T2 chip is triggered and I/O connectors are setup. (USB, NVMe, PCIe, ...) It will use NVMe and PCIe to talk to NAND storage.

4. The applicable boot disk is selected and a disk encryption password is asked if enabled to mount [APFS](https://en.wikipedia.org/wiki/Apple_File_System) volumes possibly via FileVault2 disk encryption.

5. `/System/Library/CoreServices/boot.efi` is located on your System APFS volume and [depending on your secure boot settings](https://support.apple.com/en-us/HT208330) is validated.

6. *boot.efi* is ran which loads the Darwin kernel *(throwback to BSD)* (or Boot Camp if booting Microsoft Windows) & IODevice drivers. If a kernel cache is found in `/System/Library/PrelinkedKernels/prelinkedkernel`, it will use that.

7. Any User Approved Kernel Extensions are initialized & added to the kernel space -if- they are approved by the T2 chip.
*This will go away with System Extensions*.

### macOS security features

So Apple has a couple of tricks up its sleeve to limit the attack surface of any potential security vulnerabilities. A small summary of related measures since macOS Big Sur on Intel processors:

- *System Integrity Protection* (SIP): a read-only `/System` partition so the base install of macOS (including the kernel) cannot be tampered with.

- *System Extensions*: a move to away from Kernel Extensions, getting external code out of the Kernel framework-wise.

- *Secure Boot*: verifies the signature validity of the operating system on disk.

- *Filesystem seals*: every byte of data is compared to a hash in the filesystem metadata tree, recursively verifying integrity.

### Apple marketing

As you probably all already know, Apple pushes forward privacy & security as important weapons in todays world of technology.
They tout their devices as highly secure and vouch to handle your personal data using a privacy-centric approach.
While there have been mistakes made in the past (who can blame them?), Apple has been generally quick to fix any security issues that were disclosed to [their responsible disclosure program](https://support.apple.com/en-gb/HT201220) or in public.

## Security issues

### Jailbreaking

### The core problem

The mini operating system on the T2 (*SepOS*) suffers from a security vulnerable also found in the iPhone 7 since it contains a processor based on the iOS A10. Exploitation of this type of processor for the sake of installing homebrew software is very actively discussed in the [/r/jailbreak](https://reddit.com/r/jailbreak/) subreddit.

So using the [checkm8 exploit](https://checkm8.info) originally made for iPhones, the checkra1n exploit was developed to build a semi-tethered exploit for the T2 security chip, exploiting a flaw. This could be used to e.g. circumvent activation lock, allowing stolen iPhones or macOS devices to be reset and sold on the black market.

Normally the T2 chip will exit with a fatal error if it is in DFU mode and it detects a decryption call, but thanks to the [blackbird vulnerability](https://github.com/windknown/presentations/blob/master/Attack_Secure_Boot_of_SEP.pdf) by team Pangu, we can completely circumvent that check in the SEP and do whatever we please.

Since sepOS/BootROM is *Read-Only Memory* for security reasons, interestingly, Apple cannot patch this core vulnerability without a new hardware revision.
This thankfully also means that this is not a persistent vulnerability, so it will require a hardware insert or other attached component such as a malicious USB-C cable.

### Debugging

Every Apple iDevice (which includes the T2 and the Watch, via a port under the band) ships with a firmware recovery USB interface called Device Firmware Update (DFU), which is triggered when the device is not be able to boot or by pressing a particular set of buttons when turned on.  It is always available because it is code run from SecureROM.  This is the mode in which checkm8 runs.

Apple also leaves the ability to access various debug functionality which is disabled on production devices unless a special boot payload is used which runs in DFU.  Since Apple is the only one who can sign code for DFU, they can demote any device they like, including the most recent A14 processors.
But since the checkm8 vulnerability runs so early in the boot process, we too can demote the T2 into DFU mode.
Without checkm8, we would not be able to run unsigned code in DFU and thus not be able enable debug interfaces.  Once the debug interface is enabled Apple uses specialized cables with simian names (see Chimp, Kanzi, Gorilla).

### Impact

Once you have access on the T2, you have full `root` access and kernel execution privileges since the kernel is rewritten before execution.
Good news is that if you are using FileVault2 as disk encryption, they do not have access to your data on disk *immediately*.
They can however inject a keylogger in the T2 firmware since it manages keyboard access, storing your password for retrieval or transmitting it in the case of a malicious hardware attachment.

The functionality of locking an Apple device remotely (e.g. via MDM or FindMy) can be bypassed (*Activation Lock*).

A firmware password does not mitigate this issue since it requires keyboard access, and thus needs the T2 chip to run first.

Any kernel extension could be whitelisted since the T2 chip decides which one to load during boot.

If the attack is able to alter your hardware (or sneak in a malicious USB-C cable), it would be possible to achieve a semi-tethered exploit.

While this may not sound as frightening, be aware that this is a perfectly possible attack scenario for state actors.
I have sources that say more news is on the way in the upcoming weeks. I quote: *be afraid, be very afraid*.

## Exploitation

<to be completed>
  
```
# install devtools
$ xcode-select --install

# check the script & install homebrew
$ /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"

# install packages
$ brew install libplist automake autoconf pkg-config openssl libtool llvm libusb

# git clone, autogen.sh, make & make install
# https://github.com/sbingner/ldid
# https://github.com/libimobiledevice/libusbmuxd
# https://github.com/libimobiledevice/libimobiledevice
# https://github.com/libimobiledevice/usbmuxd

# Run checkra1n and wait for T2 boot. It will stall when complete.
# TODO describe the checkra1n exploitation 

# Unplug and replug the usb connection. Checkra1n should now send the overlay.
# TODO describe the usb debug mode & overlay

# Bring up a proxy to dropbear
$ iproxy 2222 44 &

# Connect to T2 & enjoy
$ ssh -p 2222 root@127.0.0.1
```

## Responsible Disclosure

I've reached out to Apple concerning this issue on numerous occasions, even doing the dreaded cc *tcook@apple.com* to get some exposure.
Since I did not receive a response for weeks, I did the same to numerous news websites that cover Apple, but no response there as well.
In hope of raising more awareness (and an official response from Apple), I am hereby disclosing almost all of the details.
You could argue I'm not following responsible disclosure, but since this issue has been known since 2019, I think it's quite clear Apple is not planning on making a public statement and quietly developing a (hopefully) patched T2 in the newer Macs & Silicon.

## So what now as...

### ...a user

If you suspect your system to be tampered with, use Apple Configurator to reinstall bridgeOS on your T2 chip described [here](https://mrmacintosh.com/how-to-restore-bridgeos-on-a-t2-mac-how-to-put-a-mac-into-dfu-mode/). If you are a potential target of state actors, verify your SMC payload integrity and **don't** leave your device unsupervised. You could try [resetting your SMC with a keyboard combination](https://support.apple.com/en-us/HT201295).

### ...a mac sysadmin

Contact your Apple rep & wait for official news from Apple. Don't use the T2 chip for any sensitive credentials for now such as MFA.
Raise awareness to your users to not leave their device unattended.

### ...a security professional

Wait for a fix, keep an eye on [the checkra1n team](https://checkra.in) and be prepared to replace your Mac.
Be angry at news websites & Apple for not covering this issue, despite attempts from me and others to get them to report this matter.


## TL;DR

**TL;DR: recent Macs (2018-2020, T2 chip) are no longer safe to use if left alone and physical access was possible, even if you had them powered down.**

- The root of trust on macOS is inherently broken
- They can bruteforce your FileVault2 volume password
- They can alter your macOS installation
- They can load arbitrary kernel extensions

## Timeline

- 27/10/2017 Rick Mark releases a utility to verify the integrity of T1 chips & prior Macs
- 13/08/2018 aunali1 begins investigation in Linux support for Macs with T2 chip including T2 firmware.
- 29/06/2019 mram begins investigating support for NVMe drives attached to the T2
- 01/07/2019 mrarm completes PoC linux driver for T2 NVMe drives
- 03/07/2019 mrarm begins reverse engineering Apple BCE driver and USB VHCI interface for communicating with T2
- 04/08/2019 aunali1 packages linux kernel patches and mram's drivers into Arch Linux packages for distribution
- 06/10/2019 **Rick Mark postulates the impact of checkm8 for the T2 and proposes support in ipwndfu**
- 09/11/2019 Rick Mark begins research into bridgeOS
- 17/11/2019 mrarm ports SMC linux driver to support ACPI T2 controller
- 22/11/2019 aunali1 & mrarm begin investigating T2's SEP
- 03/12/2019 Rick Mark creates patches for libimobiledevice to restore T2 outside of Apple Configurator
- 15/12/2019 Rick Mark notices SecureROM/BootROM version matches iOS counterpart, indicating potentially vulnerable T2
- 06/03/2020 First successful dump of SecureROM on T2 performed
- 07/06/2020 hom3us3r published fork of checkm8/ipwndfu with T2 support
- 07/07/2020 Rick Mark notices Intel Debug interfaces (PCH/DCI) are exposed as well 
- 10/03/2020 **qwertyoriop adds support for T2 into checkra1n**
- 10/03/2020 **Rick Mark assesses how this vulnerability cannot be mitigated**
- 22/03/2020 Rick Mark creates first writeup and analysis of T2 impact
- 09/08/2020 Yalu releases blackbird, unpatcheable SEP vulnerability similar to checkm8
- 21/09/2020 checkra1n 0.11.0 with T2/bridgeOS support released
- 18/08/2020 I reached out to Apple Product Security with vulnerability details
- 21/09/2020 iOS 14 is out of a week and checkra1n is adapted for iOS 14.x, with the sepOS DFU/decrypt mitigation.
- 07/09/2020 I requested response, lack of feedback
- 16/09/2020 I requested response, lack of feedback
- 22/09/2020 I requested response, lack of feedback
- 30/09/2020 I requested response, lack of feedback, cc Tim Cook

## References

- BootROM/SepOS revisions: [The iPhone Wiki - BootROM](https://www.theiphonewiki.com/wiki/Bootrom#T8012.2C_used_in_the_iMac_Pro_and_other_T2_based_Macs)
- Big thanks to the checkra1n team and specifically [Rick Mark](https://github.com/rickmark/) to bring this to light.
- [Checkrai1n on the T2](https://twitter.com/qwertyoruiopz/status/1237400079465689088)
- [Reddit anouncement thread on /r/jailbreak](https://www.reddit.com/r/jailbreak/comments/fgi7lo/upcoming_checkra1n_support_for_the_apple_t2/fk4ofju/)
- Checkra1n website: [checkra1n](https://checkra.in/)
- checkra1n t2 OS replacement: [checkra1n/pongoOS](https://github.com/checkra1n/pongoOS)
- [How to restore your T2 chip firmware](https://support.apple.com/guide/apple-configurator-2/revive-or-restore-mac-firmware-apdebea5be51/mac)
- [ReportCyberCrime - Hackers jailbreak Apples T2 Security Chip](https://reportcybercrime.com/hackers-jailbreak-apples-t2-security-chip-powered-by-bridgeos/)
- [yalujailbreak.net - T2 Security Chip Jailbreak](https://yalujailbreak.net/t2-security-chip-jailbreak/)
