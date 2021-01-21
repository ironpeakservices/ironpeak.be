---
title: "Message Away!"
date: 2021-01-21
layout: "blog"
draft: false
---

**In light of the WhatsApp privacy controversy, I was tempted to dive deep into the clustered web that is privacy and security for instant messaging apps. Let me guide you through the mess that is secure instant messaging. Message away!**

As always, skip to the [Ending Remarks](#ending-remarks) if you don't have time to read it all.

## Introduction

Since SMS (used to) be expensive and is still not secure at all, people longed for an instant way of chatting with their friends.
This didn't go unnoticed by WhatsApp and it caught on rapidly, kicking of a new trend of using online services to chat with relatives and friends.

But... WhatsApp recently announced an update to their privacy policy which again emphasizes the fact that they were bought over by Facebook in 2014. The company used to bolster privacy & security for its users and this message was (strategically) kept even after the Facebook acquisition, but only now is Facebook coming forward with its plans to integrate WhatsApp deeply into its business platform & advertising network. Let's take you for a tour to show you how an ingenious startup slowly merged into the vast, sticky web that is Facebook.

So what is the right end-to-end encrypted (E2E) instant messaging app I should use? It's not so trivial for a regular user to determine, which is why I'm going to outline the most important factors for you to consider to protect your privacy.
Do note that apps that do not focus on E2E encryption (such as Slack, Teams, Skype, ...) are not mentioned here since the whole point is that your data belongs to the company administrating your account.
For iMessage (or anything stored in iCloud) is encrypted with a symmetric key and this key can be retrieved by Apple, this is not really E2E encryption and not included in the comparison.

### IM, Que?

Instant messaging was the next step from SMS and e-mail. People wanted to use their performant mobile phone with an always-on data connection to instantly send and receive text messages like on their personal computer. Apple facilitated this for WhatsApp by offering the Push Notification network as a medium, resulting in instant notifications when someone sent you a message without killing your battery.
Later on, people started using voice calls, video calls, sending attachments and even GIFs which kick-started a new world of communication.

### Requirements

So first let's iterate over our list of what we would like to see in a secure and privacy-conscious instant messaging app:

#### 1. Cross-platform

Our ideal IM application should be able to work on our personal devices with the same feature-set: desktop/web and mobile.
To we need an application on iOS & Android for mobile and a native or web application for macOS and Windows.

#### 2. User friendly

We want an application that's preferably native on our mobile device to swiftly open up. We need to easily get an overview of our recent contacts, jump into a conversation and easily add-in new replies, attachments, GIFs and memes or stickers (if you must).
Bonus points if the application sports a dark mode to save your eyes!

#### 3. Secure

The application we are looking for should guarantee CIA *(Confidentiality, Integrity, Availability)* of our personal data we provide to and store in the IM application.
When talking about the messages themselves, we want them to be End-to-End Encrypted (E2E) so it's only readable on our verified device.
Others should not be able to snoop into our messages, usage data or any other information that could disclose something about ourself such as usage patterns, contacts, etc...
Our data should be stored securely at rest and we need a secure way to unlock the application for us to use.
This also includes group chats, which is not always the case for every protocol.

#### 4. Privacy first

The data we insert into our IM application is very sensitive.
It describes us in a direct way (being the profile we create, our usage patterns or the way we use the app) and can be directly linked to us.
Because of this it's paramount the security is top notch and we should have sufficient fate in the trustworthiness of the application, protocol and server it is residing on.
The privacy policy of the IM application should at least describe what the entity is planning to do with our data and how it will protect it.

#### 5. Trustworthy

Because these apps are part of our daily lives (and could even be used to prosecute us in certain countries), the entity behind the IM application must have good intentions on how it is going to store, protect and process our data. Even if the entity is perfectly fine from a security or privacy perspective, it could still be lacking due to a bad monetization scheme resulting in them selling out to an evil corporate venture. Ring a bell?

### 6. Metadata

You'll notice that all contenders here support both E2E encryption which encrypts the message you are sending.
But to be able to send that unreadable encrypted data blob, it needs a whole lot of extra information to be included such as recipient, sender, time is was sent, potential logging, what server it's going to, etc...
This metadata is a functional requirement to be able to send your message without problems to your recipient.
But this metadata is *also* sensitive information, since it can disclose information about **who** you are messaging with, **when** you are messaging with that person or what the size of your messages are.
An example case; if we can see that a government employee is chatting with a reporter every morning at 9h00 and sending huge blobs of messages, the employee *can* get arrested for potential whistle-blowing.

## The Contenders

I've looked up the most promising contenders which mention end-to-end encryption as their main selling points.  
But to completely get an app, you need to be aware of the backstory and the technical foundation.  
Let's pick up those history books:

### About WhatsApp

Originally founded in 2009 by two former employees of Yahoo, WhatsApp (derived from "What's Up?" if you didn't notice before) discovered early the need for an instant messaging service using the iOS AppStore and the Apple push notification network so everyone could receive instant chat notifications even when they were not using the app.
This was a radical difference to email or SMS, resulting in a staggering user-base of 400 million users by the end of 2013.
To finally start monetizing off this massive user-base, WhatsApp announced an annual $1 subscription fee after the first year which spiked a lot of controversy with the public.
In 2014 Facebook announced it was acquiring WhatsApp for 19 billion, widening it's grip in the instant messaging market since Facebook Messenger wasn't taking on as swiftly as they had hoped. During this takeover Facebook specifically stated "it was technically impossible to automatically combine user information from Facebook and WhatsApp".
By 2015 they cracked down on 3th party clients forcing users to use their official WhatsApp implementations.
Due to the public outrage of the $1 subscription fee and the user-base slowly moving away to other services (such as Telegram), they came back in 2016 on the decision of the annual subscription fee with no clear monetization plan which raised some questions. After all, nobody wants to (and should) run such a massive messaging network for free.
While Facebook intentionally made links to Telegram unable to be clicked (confirmed via the Android clients source code), they bolstered the fact that they "would never show third-party ads" and would implement a business chat feature which at least shows some form of a fair monetization scheme.
In 2017 Facebook was eventually fined for re-using WhatsApp data such as telephone number for targeted advertising, confirming suspicions of Facebook slowly *infecting* the original WhatsApp corporate values.
Finally near the end of 2017, one of the co-founders finally left WhatsApp to found *the Signal foundation* which would give birth to the *Signal* application. A year later the other co-founder would leave too.
After implementing a set of features, the story finally ends in January 2021 when WhatsApp announced a new Privacy Policy which users will be forced to accept by February 8, 2021, or stop using the app. The new policy will allow WhatsApp to fully share data with its parent, Facebook. The new policy does **not** apply in EU, since it violates the principles of GDPR.

### About Telegram

Telegram was founded in 2013 by two Russian brothers after finding that their popular Russian social network VKontacte was taken over by pro-Putin allies. After selling shares and resisting government pressure, both left Russia with one of the brothers developing the MTProto protocol which would serve as the basis for Telegram and the other starting up a co-location facility which would finance the venture.
At this point Telegram already had around 100K active users, which would later massively increase due to the WhatsApp acquisition, South Korean governmental surveillance plans and other fluctuations.
Interestingly while Telegram specifically mentions making profits is not its end goal, the company is not structured as a non-profit organization.
The company and infrastructure later moved to Germany, where it would need to move away again soon due to failure to obtain residence permits.
The Telegram team is said to move countries with its core team of developers every so often and is currently based in Dubai.
The latest numbers of January 2021 disclose a total user-base of 500 million monthly active users.
Telegram is supposedly building its own ad platform which will appear in public channels and generate revenue for the company, along with additional enterprise features.
Telegram has been under wide scrutiny since it is heavily used as a communication medium for far-right groups, jihadists and piracy in general and some entities want it blocked or removed.

### About Signal

Signal is actually a successor of the enterprise encrypted phone app RedPhone and encrypted text message app TextSecure first launched in 2010 by Whisper Systems.
After being acquired by Twitter in 2011, the Redphone service was made unavailable for unknown reasons by Twitter.
After some public backlash because it was used by people in repressive regimes, TextSecure was finally open-sourced in December 2011 along with RedPhone in July 2012.
The original founder later left Twitter to focus on the RedPhone and TextSecure projects by starting Open Whisper Systems. At first TextSecure used SMS/MMS as a medium for communicating, encrypting the message contents but this was later switched to only using the internet connection because of various flaws within SMS/MMS implementations.
In 2015 it was announced that both applications would merge into a single app called "Signal" for Android, browser plugin and iOS. The desktop app was later on switched to a hybrid Electron program.
Around 2017 the calling system was finally switched over from the RedPhone protocol to WebRTC to also c video calling.
Interestingly in 2016 the American Civil Liberties Union released information around a subpoena where Signal had to provide information around a registered telephone number, where they could only tell the day the time the account was created and the day the last time it connected to Signals servers.
Around 2018 the founder and the co-founder of WhatsApp announced the Signal Foundation, making Signal funded by a non-profit organization with a clear mission.
Signal was popularized in the US during Black Lives Matters protests, endorsed by Elon Musk & Edward Snowden and used for delivering news to major news outlets such as the Washington Post, the New York Times, the Guardian and the Wall Street Journal.  
Signal sees a steep rise in registrations from 10 million to 50 million since the WhatsApp privacy change, even overwhelming the servers on January 2021.

### About Wire

Wire was originally created by Wire Swiss by ex-employees of Skype in December 2014. It wasn't E2E encrypted until 2016 when it adapted its Proteus protocol, when it implemented video calling as wel.
The source code of Wire client application was also released during that year.
In 2017 various news sources published concerning news around the information stored on Wires servers, including "a list of all users a customer contacted until they delete their account". Various security fixes were brought forward as wel, but those were partly mitigated in due time.
In 2018 Wire announced its enterprise offering featuring E2E chats, conferencing, video calls and file-sharing on desktop and mobile.
Interestingly in 2019 Wire changed the privacy policy from "sharing data when required by law" to "sharing data when necessary" which spiked some protest, especially since Wire is located in the US under the Patriot Act and stored unencrypted metadata of its users. This very vague language could e.g. mean "necessary to increase profits".

### About Element

Matrix is an open standard communication protocol for real-time communication originally created as a chat tool inside Amdocs, winning the Innovation Award at the WebRTC 2014 conference and Best in Show at WebRTC World in 2015. It differentiates from the Signal or mProto protocol because it was designed as an opaque data transmitter between different service providers over chat, voice over IP or video telephony.
The goal of this protocol was to provide an open protocol to combine various older protocols such as XMPP or IRCv3 which had technological & political issues becoming widely adopted.
In 2017 the funding from Amdocs was cut and the core team had to create a UK-based company called "New Vector Unlimited" to support the development of the protocol Matrix and its accompanying client application Riot, later renamed to Element. During this time period various crowdfunding efforts were created via e.g. Patreon, Liberapay, a video podcast and a weekly blog format. The company was also created with the goal of offering consultancy services for Matrix and paid hosting of Matrix servers called modular.im, later renamed to Element matrix services.

## Game on

So let's see how our contenders score on our various points, where we score very bad (-1), bad (0), good (1) and very good (2) on a total of 8 points.

### Investigating WhatsApp

**ironPeak score**: 2/10

#### 1. Cross-Platform

**Verdict**: good  
The WhatsApp mobile applications are available for Android, iOS and select phones running kaiOS.  
Desktop clients for macOS and Windows are also available, but are actually wrappers around the web equivalent since they require WhatsApp to be actively running on your application during use. WhatsApp is reportedly working on developing a full-fledged desktop client.

#### 2. User friendly

**Verdict**: very good  
The UI is WhatsApp is very user friendly with the feature-set you would expect from a popular IM application.  
There are regular chats, group chats, voice calls, video calls, stickers, GIFs, disappearing messages and adding-in attachments.

#### 3. Security

**Verdict**: good  
WhatsApp uses the Signal protocol originally developed by Signal encrypting your chat messages end-to-end.  
Communication to WhatsApp/Facebook servers happen over TLS.  
Group messages, voice calls and video calls are all routed through the Signal protocol.  
A 3th party security audit is not available for WhatsApp.
WhatsApp does not have client nor server source code available.  
WhatsApp sends unencrypted metadata to its servers which contains who you message with, how often, your location and other things.

#### 4. Privacy first

**Verdict**: bad  
WhatsApp is actively trying to get your chat metadata (usage, contacts, ...) aggregated into Facebook operations.  
Your WhatsApp profile is linked to your Facebook profile and network building is done as per Facebook.  
Advertisements will be shown in contact statuses and business pages.

#### 5. Trustworthy

**Verdict**: very bad  
Facebook has a known reputation of misusing sensitive data and profiling users for commercial benefit.

### Investigating Telegram

**ironPeak score**: 7/10

#### 1. Cross-Platform

**Verdict**: very good  
Telegram delivers native applications for linux, Windows, macOS, iOS, Android, Windows Phone and web equivalents.
Its app feels the swiftest of all contenders on both mobile and desktop.

#### 2. User friendly

**Verdict**: very good  
The Telegram is best in class in regards to user experience, it contains all features you would expect.  
It has a very large feature-set, even allowing you to create stickers from photos.

#### 3. Security

**Verdict**: good  
Although you can start secure 1-on-1 chats, this is not the case by default with regular conversations which are stored readable on Telegram servers.
Group chats are not E2E encrypted.
Communication to Telegram servers happen over TLS.
A 3th party audit is not available for Telegram.
Client implementations are open source while the server one is not.  
Metadata is not stored encrypted.

#### 4. Privacy first

**Verdict**: good  
Telegram positions itself as an outlaw, frequently traveling between jurisdictions to evade censorship of its unencrypted contents.
While they try to support open speech as much as possible, they do have [handed over](https://www.europol.europa.eu/newsroom/news/europol-and-telegram-take-terrorist-propaganda-online) limited data to Europol before.
While they do their best, I'm marking this one as 'good' since they do keep some unencrypted metadata which is sensitive such as contacts, device information and people you often message.

#### 5. Trustworthy

**Verdict**: good  
The founders seem to have the best intentions for providing a free and open IM solution.  
They will need to do some commercial activities tough to fund their development, which is unclear how that evolve.

### Investigating Signal

**ironPeak score**: 9/10

#### 1. Cross-Platform

**Verdict**: very good  
There are native Signal clients available for iOS, Android, Windows, linux and macOS.
The app starts quickly and feels quick to the touch.

#### 2. User friendly

**Verdict**: good  
The UI on the mobile clients is relatively polished with a good set of features.  
The desktop equivalent however is rather bare bone.   
Good news is that Signal is reported to have done [a survey](https://www.reddit.com/r/signal/comments/ii9uta/signal_messenger_survey/) to see where they need to improve in the UI.

#### 3. Security

**Verdict**: very good  
Everything sent is E2E encrypted using the Signal protocol, including group messages or video/voice calls.  
Communication to Signal servers happen over TLS.  
A 3th party security audit is available for the Signal protocol.  
Client and server implementations are open source.
Metadata is stored encrypted.

#### 4. Privacy first

**Verdict**: very good  
Signal tries to keep as little as possible and encrypt the rest, including metadata. 
This has proven itself to be a great privacy argument. 

#### 5. Trustworthy

**Verdict**: very good  
The Signal foundation provides a trustworthy way of supporting further development and operation of Signal.

### Investigating Wire

**ironPeak score**: 3/10

#### 1. Cross-Platform

**Verdict**: good  
Wire client applications are available for Android, iOS, Windows, linux and browsers. (lacking macOS)  
These seem to be native and pretty swift to use.

#### 2. User friendly

**Verdict**: good  
The Wire app seems like a conventional IM client, sporting all usual functionality.

#### 3. Security

**Verdict**: good  
Wire uses the Proteus protocol, which is loosely based on the Signal protocol.  
Metadata is not stored encrypted tough.

#### 4. Privacy first

**Verdict**: bad  
Wire changed its privacy policy without noticing and potentially shares its lot of unencrypted data with 3th parties.

#### 5. Trustworthy

**Verdict**: bad
Ever since the funding and takeover, Wire seems to have positioned itself more arrogantly.  

### Investigating Element

**ironPeak score**: 7/10

#### 1. Cross-Platform

**Verdict**: good  
The hybrid Element client is available for iOS, Android, macOS, Windows and linux.

#### 2. User friendly

**Verdict**: bad  
The hybrid application of Element works fine on mobile applications, but you can notice that it's quite bare-bone and slower on the desktop version.  
The feature-set is also rather limited for intensive IM usage.

#### 3. Security

**Verdict**: very good  
The matrix protocol has been thoroughly reviewed and audited and provides for a robust generic protocol.  
E2E encryption is done for everything, including groups/channels.  
Communication to the Matrix server happens over TLS.
A recent 3th party audit is not available for Element.  
Both the client and server implementation are open source.
Metadata is encrypted

#### 4. Privacy first

**Verdict**: very good  
Riot (and Element) focus on being a generic open source effort, making sure privacy is something not to worry about.  
You are encouraged to run your own Matrix server.

#### 5. Trustworthy

**Verdict**: very good  
The Matrix foundation proves a good supporter for further development around Matrix, although it's catching a bit slower than expected.

## Ending remarks

In case you made it through the whole blog post without flinching, thank you for bearing with me.  
You will have noticed that the comparison of instant messaging apps is very context-sensitive and requires a lot of technical mumbo-jumbo.  
But when looking at the most basic points which are privacy & security, we have two clear contenders: **Signal** (9/10), **Telegram** (7/ 10) and **Element**(7/10).

But while Telegram provides a superior mobile & desktop experience, the nature of the company and protocol still provide some pitfalls which move Signal forward as a winner. The fact of just having E2E for all features & metadata without any fuzz and using an openly developed + audited protocol moves **Signal** over as my personal favorite. I am aware the UI experience and features on Signal are currently not on-par with Telegram, but the recent survey and hiring of user experience experts makes me believe the are aware of the issue and that I am confident it will eb away after a while.

Do note that [you still need decent security hygiene](https://thehackernews.com/2021/01/google-discloses-flaws-in-signal-fb.html) such as installing updates, running a patched operating system and not opening suspicious links or attachments.

But does your grandma really need to switch? Yes. It is your responsibly to translate these semi-technical points to her in the form of advice.  
As always with security & privacy, awareness is key and I trust it onto you to bring forth the message.  
Edmund Burke put it ever so nicely: *"The only thing necessary for the triumph of evil is for good men to do nothing.”*

**TL;DR :** try to get your friends and family to switch from WhatsApp and **move to Signal**.  
Even if they still use Facebook/Messenger/Instagram, try to convince them to at least chat to you over a more responsible IM application.
