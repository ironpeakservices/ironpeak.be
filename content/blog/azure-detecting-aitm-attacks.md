+++
date = "2024-01-01T09:16:31+02:00"
title = "Detecting AiTM attacks in Azure"
layout = "blog"
draft = false
+++

**If you also think FIDO2 and Passkeys rhyme with PITA, try this neat little detection trick to start alerting on Office365 account compromise on Azure right now.**

### Detecting Office365 Attacker-in-the-Middle attempts in Azure

Attacker-in-the-Middle (previously called Man-in-the-Middle) attacks are on the rise unlike ever before.
Identity-based compromises (via e.g. Business Email Compromise) are still a very popular attack vector to then perform internal escalation or financial fraud.
Looking at how easy it is to buy compromised business credentials online, look them up in previous breaches or just setup an [evilnginx2 instance](), it is clear identity protection is a necessary control.

However, it isn't a perfect science either. It is public knowledge that most Azure tenants use an [Identity Protection](https://learn.microsoft.com/en-us/entra/id-protection/overview-identity-protection) configuration that merely looks at: *logon location*, *source IP address*, *previous travel history* and *HTTP User Agent request headers*. These are easily spoofed by attackers since they have access to the original request which includes this information. They merely need to pick a Virtual Private Server (VPS) in the vicinity of the user and copy all original request information in their proxied request. Identity Protection not a stop-gap solution. Nowadays Azure does have some token binding magic to try to bind tokens to specific devies, but this is still in public beta and only supported on specific Windows applications.

Don't get me wrong, there *is* a definite solution but it's just not that easy to fully roll-out: *phishing-resistant authentication*.
Using an authentication factor that relies on assymetric cryptography where the private key does not leave the device *and* is bound to the authentication domain is a bulletproof solution to prevent your credentials from being phished. (*Small note: Passkeys do synchronize on some platforms, so take appropriate care.*)
Do note that if you only rely on phishing-resistant authentication for Multifactor Authentication (MFA), you are still susceptible to phishing attacks because the attacker can still snoop your session token in cases where the user is not prompted for that MFA step-up authentication.

### Solution proposal

So suppose that you're a crafty Azure IT administrator that has phishing-resistant authentication on the roadmap, but can't yet fully roll it out yet.
You do have Identity Protection configured, but you do realize that it isn't a 100% solution. Wouldn't it be cool if you would be alerted if someone tried to login to your Azure tenant via a non-Microsoft domain? Oh, and immediately get a SIEM incident when this happens? Let's do just that today!

We'll be using a canary URL, which will get triggered behind the scenes and allow us to check the originating website the user is trying to authenticate to.
This canary URL will be loaded alongside the official Microsoft authentication web page.

There's a handy feature in the Azure portal which is called [company branding](https://learn.microsoft.com/en-us/entra/fundamentals/how-to-customize-branding) which can be used to customize your Office365 login page. Most Azure tenants use this feature to set their company logo and brand colours to spice up their company login page.<br/>

We will be using this feature to actually initiate a HTTP request behind the scenes when the user is authenticating so we can check the *Referer* HTTP Request header.
If the user is authenticating straight to a legitimate Azure tenant, this will always contain a domain such as `https:///login.microsoftonline.com/`. But if this would be a phishing domain, it will contain that domain. So if we check this domain against our whitelist, we get an easy detection use case with low noise and high value!

In case our unique background URL does get compromised (and spammed), we simply rotate it and investigate the initiator via its source IP like any other credential stuffing attack for example.

### Creating our canary endpoint

We need to host our canary endpoint publicly on the internet. To keep up with the times, I opted to use *Azure Kubernetes* to host our custom *Go* code for this.<br/>
I'm just joking, we don't need all that. We can simply make use of a simple Azure Logic App (*No code, anyone?*) that will do the heavy lifting.

1. If you have not already, create a resource group that will contain your Logic App.

2. Head to the [Azure Logic App Designer](https://portal.azure.com/#blade/HubsExtension/BrowseResourceBlade/resourceType/Microsoft.Logic%2Fworkflows) and create a new Logic App.

3. Add an HTTP trigger (*When a HTTP request is received) and ensure that it accepts `GET` requests. Copy the public endpoint URL somehwere, because this will be our canary endpoint. Do not share it openly to prevent false positives, as with most canaries.

4. Add a condition step that checks the `Referer` HTTP Request header. If this is not an official Microsoft domain (such as `https://login.microsoftonline.com/`), this is a suspicious attempt and the canary needs to be triggered. If it is not, we can just cancel the Logic App since nothing needs to be done.

5. If the canary needs to be triggered, you can create an incident in your SIEM system of choice, e.g. Microsoft Sentinel. You could also send an email, call a webhook or whatever your detection heart desires.

This should have you end up with something like this:

<br/>
<img align="middle" title="Azure Logic App example" src="/img/azure-detecting-aitm/aitm-logicapp.png" width="100%" height="auto"/>
<br/>

### Building the canary payload

Now we can build our branding canary that will be included in the Microsoft authentication web page. We can use the *Custom CSS* feature to upload our own CSS file which will actually try to load a background image from our previously created canary endpoint.

A CSS class that can be used is `ext-footer`, which is mentioned in the official [Microsoft CSS template reference guide](https://learn.microsoft.com/en-us/entra/fundamentals/reference-company-branding-css-template).  

Simply put for the visual readers, we arrive at the following;
(I will be using a fake endpoint from here onwards.)

```
.ext-footer
{
    /* Warning: without this the whole UI breaks */
    background-image: url('https://prod.westeurope.logic.azure.com/workflows/43qwe68wqewerfsd8/triggers/manual/paths/invoke/cache/image/avatar?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=FJkf3453wasjdcbzxk');
    background-size: 0 0;
}
```

I added a CSS comment to put up the assumption that this code cannot be removed in case anyone is snooping around because, ofcourse, if you block the custom CSS file from being loaded our canary will never be called.  

This also makes the URL visible to anyone snooping in the CSS file being loaded. So ideally we obfuscate this a bit that it looks a bit less obvious that we're not talking about a legitimate background image. I tried using the `data:image/svg+xml;base64,` encoding in the CSS `url()` function for `background-image`, but this always failed to actually load the image which makes me think there's a browser compatibility issue or blocker on Office365 website side.

The good thing is there's something now freely available to just help us with this: GPT. I then asked ChatGPT to cover it in some obfuscation sauce:

```
.login-border-line-cust-1 {
    font-weight: bold;
    color: #123456;
}

.login-diag-lgx {
    text-decoration: underline;
    background-color: #abcdef;
}

#modalDiagQuery {
    content: ' ';
    font-size: 1px;
    color: transparent;
    opacity: 0;
    position: absolute;
    left: -9999px;
    top: -9999px;
    pointer-events: none;
    z-index: -9999;
    visibility: hidden;
    /* More obfuscation */
    background-color: #fff;
    border: 1px solid #000;
    display: none;
    margin: 0;
    padding: 0;
    height: 0;
    width: 0;
}

.ext-footer {
    background-image: url(var(--a)var(--b)var(--c)var(--d)var(--e));
    background-size: 0 0;
    transform: rotate(0deg);
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    -webkit-font-smoothing: antialiased;
    -webkit-transition: -webkit-transform 0.3s ease-out;
    -moz-transition: -moz-transform 0.3s ease-out;
    -o-transition: -o-transform 0.3s ease-out;
    transition: transform 0.3s ease-out;
    /* End of obfuscation */
    /* Additional obfuscated styles */
    cursor: not-allowed;
    box-shadow: 0 0 0 9999px #fff inset;
    user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
    overflow: hidden;
}

:root {
    --a: 'https://prod.westeurope.logic.azure.com/';
    --b: 'workflows/43qwe68wqewerfsd8/';
    --c: 'triggers/manual/paths/invoke/cache/image/';
    --d: 'avatar?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=FJkf3453wasjdcbzxk';
    --e: '';
}
```

The neat part here is that we're creating CSS variables at the document root, which are then used in the `url()` function to construct the full URL.
This already is a bit harder to read and requires the curious mind to look at the bottom of the document.

Let's do one more round and ask GPT to inject some more garbage CSS code and split out the root statement across multiple lines:

```
/* Random CSS classes with meaningless properties */
.random-class-3 {
    margin: 0;
    padding: 0;
    border: none;
    outline: none;
    cursor: default;
}

/* Original CSS */

/* Part 1 of :root variable */
:root {
    --a: 'https://prod.westeurope.logic.azure.com/';
}

.random-class-4 {
    font-family: 'RandomFont', sans-serif;
    line-height: 1.5;
    letter-spacing: 1px;
    text-align: justify;
}

/* Part 2 of :root variable */
:root {
    --b: 'workflows/43qwe68wqewerfsd8/';
}

.login-border-line-cust-1 {
    font-weight: bold;
    color: #123456;
}

/* Part 3 of :root variable */
:root {
    --c: 'triggers/manual/paths/invoke/cache/image';
}

.login-diag-lgx {
    text-decoration: underline;
    background-color: #abcdef;
}

#modalDiagQuery {
    content: ' ';
    font-size: 1px;
    color: transparent;
    opacity: 0;
    position: absolute;
    left: -9999px;
    top: -9999px;
    pointer-events: none;
    z-index: -9999;
    visibility: hidden;
    /* More obfuscation */
    background-color: #fff;
    border: 1px solid #000;
    display: none;
    margin: 0;
    padding: 0;
    height: 0;
    width: 0;
}

/* Part 4 of :root variable */
:root {
    --d: 'footer_line_svg?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=FJkf3453wasjdcbzxk';
}

.ext-footer {
    background-image: url(var(--a)var(--b)var(--c)var(--d)var(--e));
    background-size: 0 0;
    transform: rotate(0deg);
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    -webkit-font-smoothing: antialiased;
    -webkit-transition: -webkit-transform 0.3s ease-out;
    -moz-transition: -moz-transform 0.3s ease-out;
    -o-transition: -o-transform 0.3s ease-out;
    transition: transform 0.3s ease-out;
    /* End of obfuscation */
    /* Additional obfuscated styles */
    cursor: not-allowed;
    box-shadow: 0 0 0 9999px #fff inset;
    user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
    overflow: hidden;
}

/* Part 5 of :root variable */
:root {
    --e: '';
}
```

Now this looks a bit more menacing already! Now let's just make it more difficult to read;

```
.random-class-3{margin:0;padding:0;border:none;outline:none;cursor:default}.random-class-4{font-family:'RandomFont',sans-serif;line-height:1.5;letter-spacing:1px;text-align:justify}.random-class-3,.random-class-4,.login-border-line-cust-1{font-weight:bold;color:#123456}.login-diag-lgx{text-decoration:underline;background-color:#abcdef}#modalDiagQuery{content:' ';font-size:1px;color:transparent;opacity:0;position:absolute;left:-9999px;top:-9999px;pointer-events:none;z-index:-9999;visibility:hidden;background-color:#fff;border:1px solid #000;display:none;margin:0;padding:0;height:0;width:0}.ext-footer{background-image:url(var(--a)var(--b)var(--c)var(--d)var(--e));background-size:0 0;transform:rotate(0deg);clip:rect(0 0 0 0);clip-path:inset(50%);-webkit-font-smoothing:antialiased;-webkit-transition:-webkit-transform 0.3s ease-out;-moz-transition:-moz-transform 0.3s ease-out;-o-transition:-o-transform 0.3s ease-out;transition:transform 0.3s ease-out;cursor:not-allowed;box-shadow:0 0 0 9999px #fff inset;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;overflow:hidden}:root{--a:'https://prod.westeurope.logic.azure.com/';--b:'workflows/43qwe68wqewerfsd8/';--c:'triggers/manual/paths/invoke/cache/image';--d:'footer_line_svg?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=FJkf3453wasjdcbzxk'}.random-class-3,.random-class-4,:root{--e:''}
```

The trick here is to get everything on one line, where people either need to re-format the CSS code in an editor or need to scroll all the way to the right.
Again, this is not a 'secure' solution in its own sense but is just to ward off a portion of the assessors.

### Uploading the canary endpoint

Now head over to your [Azure Company Branding page](https://entra.microsoft.com/#view/Microsoft_AAD_UsersAndTenants/CompanyBrandingOverview.ReactView) and go through the Edit wizard. When it asks to upload a `Custom CSS` file, select your previously created canary CSS file. Now Save. Note that this requires *Global Administrator* permissions.

<br/>
<img align="middle" title="Custom CSS section" src="/img/azure-detecting-aitm/customcss.png" width="100%" height="auto"/>

This usually takes around 10-20 minutes for the change to propagate across the Azure CDN. Make sure to disable browser caching when testing.

### Profit!

Now keep an eye on the *Overview* tab of your Logic App. Most if not all of your runs should have status *Cancelled*, meaning nothing needed to be done.
If you see a *Completed* status, this means the canary was triggered by means of an unknown *Referer* domain and needs investigation.

Happy detecting!
