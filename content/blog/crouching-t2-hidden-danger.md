---
date: "2020-10-05T09:56:54+02:00"
title: "Crouching T2, Hidden Danger"
layout: "blog"
draft: false
---

**Let's talk about that thing nobody's talking about.
Let's talk about that vulnerability that's completely exposing your macOS devices while news agencies and Apple are declining to act and report about the matter.
Oh, and did I mention it's unpatchable?**

**Settle in buckaroo, we're in for a wild ride.**

Skip to [#security-issues](#security-issues) for the technical mumbo-jumbo.

Preface: this blog post is still under review and will be extended/modified.

## Preface

### Intel vs Silicon

This blog post only applies to macOS systems with an Intel processor and the secondary T2 chip.
Apple silicon systems will run completely on a set of ARM processors designed by Apple and thus will use a different boot topology.
Because of this it's possible Apple silicon systems will not be impacted by this vulnerability, but this is yet to be seen.
And besides... let's hope it's fixed by then. :-)

### So about this T2 thing

In case you are using a recent macOS device, you are probably using [the embedded T2 security chip](https://support.apple.com/en-us/HT208862) which runs *bridgeOS* and is based off watchOS. This is a custom ARM processor designed by Apple and based on the A10 CPU found in the iPhone 7.
The T2 chip contains a *Secure Enclave Processor* (SEP), much like the A-series processor in your iPhone will contain a SEP.

It performs a predefined set of tasks for macOS such as audio processing, handling I/O, functioning as a [Hardware Security Module](https://en.wikipedia.org/wiki/Hardware_security_module) for e.g. Apple KeyChain, hardware accelerating media playback & cryptographic operations and **ensuring the operating system you are booting is not tampered with**.
The T2 chip runs its own firmware called *bridgeOS*, which can be updated when you install a new macOS version. (ever notice the screen flickering? that's the display driver being interrupted.)

*Edit*: I first mentioned the iPad Pro to be impacted by the T2 vulnerability, but while it could suffer from the same debug cable vulnerability, it does not contain a T2 chip. 


### The macOS boot sequence

So let's focus on the boot image verification on macOS. What exactly happens when you press that power button?
[There's also a visual representation for any *conaisseurs*](https://eclecticlightdotcom.files.wordpress.com/2018/08/bootprocess.png).

You could also say that [Booting Secure by mikeymikey](http://michaellynn.github.io/2018/07/27/booting-secure/) is a better summary.

0. The T2 chip is fully booted and stays on even if macOS is shutdown.

1. The press of the power button or the opening of the lid triggers the System Management Controlle (SMC) to boot.

2. The SMC performs a Power-On-Self-Test (POST) to detect any EFI or hardware issues such as bad RAM and possibly redirect to Recovery.

3. After those basic sanity checks, the T2 chip is triggered and I/O connectors are setup. (USB, NVMe, PCIe, ...) It will use NVMe and PCIe to talk to NAND storage.

4. The applicable boot disk is selected and a disk encryption password is asked if enabled to mount [APFS](https://en.wikipedia.org/wiki/Apple_File_System) volumes possibly via FileVault2 disk encryption.

5. `/System/Library/CoreServices/boot.efi` is located on your System APFS volume and [depending on your secure boot settings](https://support.apple.com/en-us/HT208330) is validated.

6. *boot.efi* is ran which loads the Darwin kernel *(throwback to BSD)* (or Boot Camp if booting Microsoft Windows) & IODevice drivers. If a kernel cache is found in `/System/Library/PrelinkedKernels/perlinkedkernel`, it will use that.

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

### The core problem

The mini operating system on the T2 (*SepOS*) suffers from a security vulnerable also found in the iPhone X since it contains a processor based on the iOS A10 processor. Exploitation of this type of processor is very actively discussed in the [/r/jailbreak](https://reddit.com/r/jailbreak/) subreddit.

So using the [checkm8 exploit](https://checkm8.info) originally made for iPhones, the checkra1n exploit was developed to build a semi-thetered exploit for the T2 security chip, exploiting a flaw. This could be used to e.g. circumvent activation lock, allowing stolen iPhones or macOS devices to be reset and sold on the black market.

Normally the T2 chip will exit with a fatal error if it is in DFU mode and it detects a decryption call, but thanks to the [blackbird vulnerability](https://github.com/windknown/presentations/blob/master/Attack_Secure_Boot_of_SEP.pdf) by team Pangu, we can completely circument that check in the SEP and do whatever we please.

Since sepOS/BootROM is *Read-Only Memory* for security reasons, interestingly, Apple cannot patch this core vulnerability without a new hardware revision.
This thankfully also means that this is not a persistent vulnerability, so it will require a hardware insert or other attached component such as a malicious USB-C cable.

### Debugging vulnerability

Apple left a debugging interface open in the T2 security chip shipping to customers, allowing anyone to enter Device Firmware Update (DFU) mode without authentication.
An example cable that can be used to perform low-level CPU & T2 debugging is the JTAG/SWD debug cable found on the internet. Using the debug cable requires demotion however to switch it from a *production* state, which is possible via the checkm8 exploit.
See an example of it being used [in this Twitter post](https://twitter.com/h0m3us3r/status/1280432544731860993).

Using this method, it is possible to create an USB-C cable that can automatically exploit your macOS device on boot. **(!)**

### Impact

Once you have access on the T2, you have full `root` access and full kernel execution privileges since the kernel is rewritten before execution.
Good news is that if you are using FileVault 2 as disk encryption, they do not have access to your data on disk *immediately*.
They can however inject a keylogger in the T2 firmware since it manages keyboard access, storing your password for retrieval.

The functionality of locking an Apple device remotely (e.g. via MDM or FindMy) can also be bypassed (*Activation Lock*).

A firmware password does not mitigate this issue since it requires keyboard access, and thus needs the T2 chip to run first.

If the attack is able to alter your hardware (or sneak in a malicious USB-C cable), it would be possible to achieve a semi-tethered exploit.

I have sources that say more news is on the way coming weeks. I quote my source: *be afraid, be very afraid*.

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
...

# Unplug and replug the usb connection. Checkra1n should now send the overlay.
...

# Bring up a proxy to dropbear
$ iproxy 2222 44 &

# Connect to T2 & enjoy
$ ssh -p 2222 root@127.0.0.1
```

## Responsible Disclosure

I've reached out to Apple concerning this issue on numerous occasions, even doing the dreaded cc *tcook@apple.com* to get some exposure.
Since I did not receive a response for weeks, I did the same to numerous news websites that cover Apple, but no response there as wel.
In hope of raising more awareness (and an official response from Apple), I am hereby disclosing almost all of the details.

## So what now as...

### ...a user

If you suspect your system to be tampered with, use Apple Configurator to reinstall bridgeOS on your T2 chip described [here](https://mrmacintosh.com/how-to-restore-bridgeos-on-a-t2-mac-how-to-put-a-mac-into-dfu-mode/). If you are a potential target of state actors, verify your SMC payload integrity and **don't** leave your device unsupervised.

### ...a mac sysadmin

Contact your Apple rep & wait for official news from Apple. Don't use the T2 chip for any credentials for now. (such as MFA)
Raise awareness to your users to not leave their device lingering.

### ...a security professional

Wait for a fix, keep an eye on the checkra1n team and be prepared to replace your macOS system.
Be angry at news websites & Apple for not covering this issue, despite numerous attempts from me and others to get them to report about this.


## TL;DR

**TL;DR: all recent macOS devices are no longer safe to use if left alone, even if you have them powered down.**

- The root of trust on macOS is inherently broken
- They can bruteforce your FileVault2 volume password
- They can alter your macOS installation
- Only possible on physical access

## Timeline

- 27/09/2019 checkm8 exploit is first released for iPhone 4S - iPhone X
- 11/11/2019 checkra1n is released for iOS 13-13.7
- 18/08/2020 I reached out to Apple Product Security with vulnerability details
- 21/09/2020 iOS 14 is out of a week and checkra1n is adapted for iOS 14.x, with the sepOS DFU/decrypt mitigation.
- 07/09/2020 I requested response, lack of feedback
- 16/09/2020 I requested response, lack of feedback
- 22/09/2020 I requested response, lack of feedback
- 30/09/2020 I requested response, lack of feedback, cc Tim Cook

## References

- BootROM/SepOS revisions: [The iPhone Wiki - BootROM](https://www.theiphonewiki.com/wiki/Bootrom#T8012.2C_used_in_the_iMac_Pro_and_other_T2_based_Macs)
- Big thanks to the checkra1n team and specifically [Rick Mark](https://github.com/rickmark/) to bring this to light.
- Checkra1n website: [checkra1n](https://checkra.in/)
- checkra1n t2 OS replacement: [checkra1n/pongoOS](https://github.com/checkra1n/pongoOS)
- [How to restore your T2 chip firmware](https://support.apple.com/guide/apple-configurator-2/revive-or-restore-mac-firmware-apdebea5be51/mac)
- First (and only?) article about it: [yalujailbreak.net - T2 Security Chip Jailbreak](https://yalujailbreak.net/t2-security-chip-jailbreak/)
