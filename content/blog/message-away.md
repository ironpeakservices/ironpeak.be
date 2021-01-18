---
title: "Message Away"
date: 2021-01-18
layout: "blog"
draft: false
---

**In light of the WhatsApp privacy convercy, I've been tempted to dive deep into the clustered web that is instant messaging apps and their privacy and security. Message away!**

## Introduction

WhatsApp recently anounced an update to their privacy policy which again emphasizes the fact that they were bought over by Facebook in 2014. The company used to bolster privacy & security for its users and this message was (strategically) kept even after the Facebook acquisition, but only now is Facebook coming forward with its plans to integrate WhatsApp deeply into its business platform & advertising network. Let's take you for a tour to show you how an ingenious startup slowly merged into the vast, sticky web that is Facebook.

### IM, Que?

Instant messaging was the next step from SMS and e-mail. People wanted to use their performant mobile phone with an always-on data connection to instantly send and receive text messages like on their personal computer. Apple facilitated this for WhatsApp by offering the Push Notification network as a medium, resulting in instant notifications when someone sent you a message without killing your battery.
Later on, people started using voice calls, video calls, sending attachments and even GIFs which kickstarted a new world of communication.

### Requirements

So first let's iterate over our list of what we would like to see in a  

#### Cross-platform

Our ideal IM application should be able to work on our personal devices with the same featureset: desktop/web and mobile.
To we need an application on iOS & Android for mobile and a native or web application for macOS and Windows.

#### User friendly

We want an application that's preferably native on our mobile device to swiftly open up. We need to easily get an overview of our recent contacts, jump into a conversation and easily add-in new replies, attachments, GIFs and memes or stickers (if you must).
Bonus points if the application sports a dark mode to save your eyes!

#### Secure

The application we are looking for should guarantee CIA *(Confidentiality, Integrity, Availibility)* of our personal data we provide to and store in the IM application.
When talking about the messages themselves, we want them to be End-to-End Encrypted (E2E) so it's only readable on our verified device.
Others should not be able to snoop into our messages, usage data or any other information that could disclose something about ourself such as usage patterns, contacts, etc...
Our data should be stored securely at rest and we need a secure way to unlock the application for us to use.

#### Privacy first

The data we insert into our IM application is very sensitive.
It describes us in a direct way (being the profile we create, our usage patterns or the way we use the app) and can be directly linked to us.
Because of this it's paramount the security is top notch and we should have sufficient fate in the trustworthyness of the application, protocol and server it is residing on.
The privacy policy of the IM application should at least describe what the entity is planning to do with our data and how it will protect it.

#### Trustworthy

Because these apps are part of our daily lives (and could even be used to prosecute us in certain countries), the entity behind the IM application must have good intentions on how it is going to store, protect and process our data. Even if the entity is perfectly fine from a security or privacy perspective, it could still be lacking due to a bad monetization scheme resulting in them selling out to an evil corporate venture. Ring a bell?

### Metadata

You'll notice that all contenders here support both E2E encryption which encrypts the message you are sending.
But to be able to send that unreadable encrypted data blob, it needs a whole lot of extra information to be included such as recipient, sender, time is was sent, potential logging, what server it's going to, etc...
This metadata is a functional requirement to be able to send your message without problems to your recipient.
But this metadata is *also* sensitive information, since it can disclose information about **who** you are messaging with, **when** you are messaging with that person or what the size of your messages are.
An example case; if we can see that a government employee is chatting with a reporter every morning at 9h00 and sending huge blobs of messages, the employee *can* get arrested for potential whistleblowing.

## The Contenders

### About WhatsApp

Originally founded in 2009 by two former employees of Yahoo, WhatsApp (derived from "What's Up?" if you didn't notice before) discovered early the need for an instant messaging service using the iOS AppStore and the Apple push notification network so everyone could receive instant chat notifications even when they were not using the app.
This was a radical difference to email or SMS, resulting in a staggering userbase of 400 million users by the end of 2013.
To finally start monetizing off this massive userbase, WhatsApp anounced an annual $1 subscription fee after the first year which spiked a lot of controversy with the public.
In 2014 Facebook anounced it was acquiring WhatsApp for 19 billion, widening it's grip in the instant messaging market since Facebook Messenger wasn't taking on as swiftly as they had hoped. During this takeover Facebook specifically stated "it was technically impossible to automatically combine user information from Facebook and WhatsApp".
By 2015 they cracked down on 3th party clients forcing users to use their official WhatsApp implementations.
Due to the public outrage of the $1 subscription fee and the userbase slowly moving away to other services (such as Telegram), they came back in 2016 on the decision of the annual subscription fee with no clear monetization plan which raised some questions. After all, nobody wants to (and should) run such a massive messaging network for free.
While Facebook intentionally made links to Telegram unclickeable (confirmed via the Android clients source code), they bolstered the fact that they "would never show third-party ads" and would implement a business chat feature which at least shows some form of a fair monetization scheme.
In 2017 Facebook was eventually fined for re-using WhatsApp data such as telephone number for targetted advertising, confirming suspicions of Facebook slowly *infecting* the original WhatsApp corporate values.
Finally near the end of 2017, one of the cofounders finally left WhatsApp to found *the Signal foundation* which would give birth to the *Signal* application. A year later the other cofounder would leave too.
After implementing a set of features, the story finally ends in January 2021 when WhatsApp announced a new Privacy Policy which users will be forced to accept by February 8, 2021, or stop using the app. The new policy will allow WhatsApp to fully share data with its parent, Facebook. The new policy does **not** apply in EU, since it violates the principles of GDPR.

### About Telegram

Telegram was founded in 2013 by two Russian brothers after finding that their popular Russian social network VKontacte was taken over by pro-Putin allies. After selling shares and resisting government pressure, both left Russia with one of the brothers developing the MTProto protocol which would serve as the basis for Telegram and the other starting up a colocation facility which would finance the venture.
At this point Telegram already had around 100K active users, which would later massively increase due to the WhatsApp acquisition, South Korean governmental surveillance plans and other fluctuations.
Interestingly while Telegram specifically mentions making profits is not its end goal, the company is not structured as a non-profit organization.
The company and infrastructure later moved to Germany, where it would need to move away again soon due to failure to obtain residence permits.
The Telegram team is said to move countries with its core team of developers every so often and is currently based in Dubai.
The latest numbers of January 2021 disclose a total userbase of 500 million montly active users.
Telegram is supposedly building its own ad platform which will appear in public channels and generate revenue for the company, along with additional enterprise features.
Telegram has been under wide scrutiny since it is heavily used as a communication medium for far-right groups, jihadists and piracy in general and some entities want it blocked or removed.

### About Signal



### About Wire



### About Matrix/Elements



## Game on

### Investigating WhatsApp

### Investigating Telegram

### Investigating Signal

### Investigating Wire

### Investigating Matrix/Elements

## Ending remarks

sdad

**TL;DR: try to get your friends and familiy to switch from WhatsApp(/Facebook+Messenger+Instagram) and move to Signal or Telegram.
If they use Facebook, Messanger or Instagram still try to convince them to chat over a separate IM application.**
