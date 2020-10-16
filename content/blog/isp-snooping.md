---
title: "ISP Snooping"
date: 2019-12-27T09:31:14+01:00
layout: "blog"
draft: false
---

**A recent network issue with my ISP connection triggered me to delve into what my ISP could know about me, and what everyone can do about that. Let's dive into the paranoia! A note: this is mainly a brain dump and might contain some unproven claims... so as always on the internet: YMMV.**

## Preface

### My Problem

For the people that not know me personally: I am kind of a data hoarder. No, seriously, I am a self-proclaimed datahoarder lurking on [/r/datahoarder](https://reddit.com/r/datahoarder/). This means that I ingest huge amounts of downloadable data every month that is then consumed by several tools ran on my server at home.
The reason why I do not currently rent or colocate this server is because this also serves as a local encrypted backup facility for all of my devices, which it can then encrypt & push to the cloud using differential backups over snapshots. It sounds techy, but I'm working on [the 3-2-1 backup rule](https://www.backblaze.com/blog/the-3-2-1-backup-strategy/). This all means that my bandwidth limit is always in the terabytes, mostly around 4 TB per month.

### My ISP Subscription

This means I have to make use of a truly unlimited subscription with my ISP which is typically a business subscription, which is fine since I have my own company. (You're on the website of it, eh?) The basic gist of it is: consume anything you want, whenever you want.
It was only a month ago that I had to take one of the more expensive subscriptions to be able to benefit from this, but thank god to commercial pressure this is now possible for every business customer. Or so it is supposed be... Before this switch, you were put on a small-band segment which basically means a capped 1Mbps/0.5Mbps which would normally trigger you to pay extra for a measly extra 50 Gigabytes download. Which is then burned through again. :-(
A shout out to my dedicated sales person at my ISP, who I keep bombarding with queries like "when is the Video On Demand feature finally coming to Business customers?" or "This unlimited internet isn't really unlimited". I'm probably part of the noisy 5% of technical customers that they do not like at all.

### The Issue

So my subscription was supposed to be switched to the new 'truly unlimited' subscription, without any limit of any kind. (I would still have the "fair use policy") However, for some reason my subscription lingered and I hit the 3TB limit, forcing me to small-band. No problem, a call to my assistant and they modified my subscription for good. Good? Nope. Since the day after (& the good ole' modem restart later) I still saw no difference, I called technical support.
My bandwidth limit was manually increased, but I was still in the small-band segment. And to make matters worse, this also collided with my occasional LAN party at home... So I called again on Christmas eve (can you already sense the level of frustration?), which triggered the following response:

***Ehh, I see you are ingesting hundreds of Gigabytes from 'news' websites daily, are you sure you don't suffer from a malware infection?***

Let that sink in.

How the hell did they know that I download from websites categorized as 'news'? And how could they be making this assumption?

## Role of the ISP

### Technical

#### Base Product

First of all, the main role of the *Internet Service Provider* is to provide you with the technical means to either: connect to the internet, watch television or be connected to the worldwide telephone network. Nowadays, the line between those services is fading away with *Video On Demand* and *Voice-Over-LTE*/*Voice-Over-WiFi*, so let's jump ahead a few years and assume everything runs over [L3 Ethernet](https://en.wikipedia.org/wiki/OSI_model#Layer_architecture).
It is the job of your ISP to connect your home to an extremely complex web of network connections that spans the globe. Out of my head, this can be seen bottom-up as:

1. Your **local home network** is everything up to your router/modem. So this includes cabled (Ethernet) connections and wireless (WiFi).

2. Your **home network connection**, (hopefully) coax or fiber from your router/modem to the nearest connection hub of your ISP in your street.
Your modem/router receives a public IPv4 (and possibly IPv6) address and places your local home network behind a NAT. So in theory, none of your home devices should be available on the internet, while they can speak to it. They often use *uPnP* (*Universal Plug & Play) to punch holes and setup *Port Forwards* on your modem/router.

3. The **ISP** which (in this case) is a *Tier 2 Provider* that runs from the local connection hub over fiber to the ISP edge router.

4. The "hidden" **Tier 1 Internet Provider** which connects the local *Tier 2* ISPs to the rest of the world through *Point-of-Presence* points or direct peering agreements with other *Tier 1 Providers* through *IXP connections*, all using (very) high-bandwidth fiber bundles.

When buying your subscription, you agree to the "fair use policy" and possible bandwidth/speed limits imposed by your ISP. This is because they typically undersell their capacity to either: 1) protect against failures and/or attacks and more importantly 2) be able to raise the bar **and price** later on without extra investments. After all, upgrading the core switches in every local hub on every street, every home router/modem or even opening up streets to replace coax with fiber is a *very** expensive investment. But to make it more complex, they also oversell their guessed capacity by a bit.
This is because the ISP factors in a typical use case for your specific subscription and assumes that most of the users will only use up a small portion of the bandwidth reserved for them, allowing it to be used by other heavy users. This is the point of the whole "peak and off-peak hours" arrangement, since they assume most people will be watching their Netflix shows or operating their business during the day whole not a lot are during the night.

#### Problem Scenarios

So it is their duty to be able to maintain a steady internet infrastructure and connection for every customer. But what if a customer does not fit into the standard usage pattern? A couple of scenarios:

* Someone hosting a heavy traffic website

* Someone downloading and sharing loads of data generating thousands of connection (P2P, e.g. BitTorrent)

* Someone launching malware/DoS/... attacks from their home network with or without their knowing

* ...

It's not really a guesstimate that the ISP is heavily motivated to want to know about possible misuse of their service.
They want to know who is impacting the other fair use customers so they can provide the quality of service they sell.

### Commercial

The days of *One fits All* are gone. Content fitted to your needs is all the rage nowadays, where they track what/where/when you use their product, so they can estimate the probability of you consuming additional/better products, increasing their profits and/or margins on you. Think to yourself, have you never been called because they suggest you better switch to another product, which would be more expensive, provide better analytics or be more cost effective to them?
This could be a bigger internet subscription, extra telephone subscriptions or to rent that new fancy movie you wanted to see but couldn't last month.

This feeds nicely to another important player in the commercial field: advertisements. Despised by most technical customers & liked by all companies, personalizing the ads to the customer greatly benefits both parties: you are less frustrated because of watching ads you don't care about and the company might actually sell more because of some advertisement you watched. So, win-win, right? Wrong. The company can now build a profile about you which might pose a serious privacy risk. What if they sell this data to other (international?) parties? What if your customer profile is used by your future employer? It's a real-life Black Mirror episode.

### Legal

The ISP is also legally required to act their part to investigate legal claims & prosecutions. This means that they need to be able to provide all information they have about you to a governmental legal entity. So, it's in their best interest to collect information about you and your usage to later give to the authorities, so they comply to the regulation and keep up the brand image. No ISP will survive if they don't make friends with their facilitators.

## Problem Factors

So, let's take a look at a summary of all the things that could be tracked about you. Be warned that I assume you are using standard best practices such as visiting websites over TLS (HTTPS). Visiting a website over HTTP to then be redirected to HTTPS still leaks the website information.

I call this *the naughty list*:

### Network Layer

A very simple factor, but one that is often missed, is that they can simply **look up the IP addresses** that you are connecting to.
On one hand there are IP classification records made available on the internet (free & paid). Since this a very easy and quick method (meaning it scales well across customers), this is the minimum an ISP can do to already track what you are doing online.

### DNS

Often overlooked, but they could be **snooping your [DNS](https://www.cloudflare.com/learning/dns/what-is-dns/) queries**. Since the start of the internet DNS queries have been plaintext, meaning anyone can read what website you are about to visit. (But not what page you are visiting on that website per se.)
This is a more expensive method, since they now have to identify & parse the L7 data that is passing over the wire. There exist solutions that offload a lot of the work to the hardware, to this could be scaled to ISP-level. Business customers often do this inside of a [Intrusion Detection System](https://www.varonis.com/blog/ids-vs-ips/) or even Open Source with Snort/Suricata. Note that using DNSSEC provides integrity, but not confidentiality.

### HTTP over TLS (HTTPS)

But suppose you are encrypting your HTTPS traffic? In that case, one could still sniff the [Server Name Indicator](https://en.wikipedia.org/wiki/Server_Name_Indication) whenever you are visiting a website over HTTPS. This is basically used to indicate what website you would like to visit when there are multiple websites hosted behind the same public certificate.
A fun note: China is now blocking TLS version 1.3 with encrypted SNI to make sure that their 'Great Firewall' can block the websites you visit.

### Protocol Fingerprinting

Pulling this broader, the ISP could be **fingerprinting every L7 protocol** that is spoken over the wire. This way they could be identifying heavy torrent users.
This does not mean they are reading *what* you are torrenting, but just that you are running the BitTorrent protocol. This is a popular detection, especially for mitigating contention on the network. e.g. My ISP has specific rules for P2P traffic on set time intervals.

### Customer Record

Be sure that everything you use that is sold by the ISP is tracked to some extent. How often you call to international numbers, when & how you watch TV, etc...
A very practical example: loads of people watching TV through their laptops & tablets triggered a shift to Video-on-Demand with my ISP.

### Tracking

And last but not least, what if the ISP was just **injecting tracking code** in your visited websites? This isn't true for the biggest part of Western Europe, but I’ve seen cases documented where the ISP injected JavaScript tracking code in plain HTTP calls or even requiring you to install their own rogue [Root CA Certificate](https://en.wikipedia.org/wiki/Root_certificate), so they perform a Man-in-the-Middle Attack.
And as always, install a reputable Anti Virus and Firewall on your device.

## Factor Mitigations

So the proof is in the pudding: what can be do about this? Let's dub this the **nice list**:

### Network Layer

One of the most commonly proposed mitigations still stands true: a Virtual Private Network (VPN) connection.
This is basically an encrypted tunnel to a third party, to ensure that e.g. your ISP cannot see what you are transferring to that party.
But be sure to pick a reliable one that also respects your privacy or run one yourself using [shadowsocks](https://shadowsocks.org/) or [wireguard](https://www.wireguard.com/). Do your research.

### DNS

Setup a DNS-over-TLS (DoT) or DNS-over-HTTPS (DoH) server that will act as a DNS forwarder on your network.
I recently did this on my EdgeRouter PoE in around 20 minutes, but you could run your own using [cloudflared](https://github.com/cloudflare/cloudflared), [DNSCrypt](https://dnscrypt.info/) or [PiHole](https://pi-hole.net/) (also blocks ads).
You would then configure this one to use a trusted DNS server, like 1.1.1.1/1.0.0.1 Cloudflare. Lots of people recommend Google DNS Servers (8.8.8.8/8.8.4.4), but those are known to use your DNS traffic for analysis purposes.

### HTTP over TLS (HTTPS)

To prevent snooping of HTTP traffic client-side, install an extension like HttpsAnywhere or enable [Automatic Https Upgrade on Safari](https://lavaux.lv/2019/10/25/automatic-HTTPS-upgrades-safari-ios.html).
For SNI snooping, browsers & providers are starting to work on [Encrypted SNI (ESNI)](https://blog.cloudflare.com/esni/), but not much more to mention there than to wait for TLS version 1.3 to be widely supported and used.
It's also possible to just drop traffic to :80 on your devices & router, but that might/will break functionality on some mobile or desktop apps.

### Protocol Fingerprinting

Not much to tell here, except to use standard protocols as much as possible and prevent some well-known ones like BitTorrent.
e.g. it is possible to hide your SSH connections in HTTPS traffic using something like [stunnel](https://www.stunnel.org/).
If you are using BitTorrent, either switch to Usenet newsgroups or opt for a VPN.

### Customer Record

First important factor is being aware that you are being tracked. Disabled unused app functions in Android or iOS.
Prevent your app from running in the background, using data entirely or e.g. using your camera or reading your contacts.
Secondly, set your ISP profile preferences to not receive any personalized advertisements if applicable.
Thanks to [GDPR](https://gdpr-info.eu/), companies that process your information are now legally obliged to respond to GDPR queries. e.g. You can request them to provide all information they have about you, whether technical or commercial. Do this now with your ISP!
*I am still awaiting my enquiry...*

### Tracking

For mobile applications, only use the official app stores and disabled all unneeded app access in the system settings.
For browsers, use a reputable adblocker and look up [degoogle](https://reddit.com/r/degoogle/) for ideas.
e.g. You can switch to DuckDuckGo instead of Google Search Engine.

## Ending Remarks

More than ever **we are obliged to be aware of any threats to our electronic identity**.
You should review every proposal or action of any corporate entity with a grain of salt and review it under your requirements.

A fun case study: My ISP recently launched a possible addon to the internet subscription, where they can monitor your personal devices (laptop, mobile device) for threats and protect your IoT devices. So what does this mean in technical terms?

1) They basically offer a rebranded antimalware engine (likely Bitdefender)
2) They install a proprietary heuristic detection engine on your modem/router that ships off data to an Israeli company that fingerprints your devices and can block them from opening up ports if needed.

How would this map to our mitigations? 1) is satisfied by running your own choice of Anti Virus, while 2) is satisfied by just turning off uPnP.
But if you don't want that, you could always just ship everything to Israel and hope for the best. :-)

**TL;DR: Yes, they probably are for a multitude of reasons.**
