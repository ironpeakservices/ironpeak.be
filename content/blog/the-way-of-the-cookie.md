+++
date = "2024-04-28T09:16:31+02:00"
title = "The way of the Cookie"
layout = "blog"
draft = false
+++

**For everyone in the room who is somewhat of an IT administrator to one or more Azure (including Office365) tenants, please raise your hand if you've been bestowed with the gift (or curse) of permanent administrative permissions. Cue nervous laughter. Sounds a bit risky, right?  Imagine the chaos if that account ever fell into the wrong hands. But how could one ever fix this at all if you need those to do your job? Let me show you the way of the cookie, a vastly underutilized feature of Azure. So grab a cookie and let's crunch through this together.**

### Problem statement

So, you're rocking those permanent admin permissions in Azure. It's like being the king of the castle.
In all probability, you're already happy your tenant is functioning sanely and users are happy-ish.
But hold up, isn't that a bit... risky?
In a world where cyber threats are as common as pigeons in the park, having eternal access is like leaving your front door wide open in a sketchy neighborhood.
But here's the kicker: you need those permissions to get stuff done, right?
It's the ultimate dilemma: damned if you do, doomed if you don't.
But let's delve deeper into the trenches of Azure's landscape to understand why this dilemma is more than just a mere inconvenience.

Permissions in Azure are structured in a way that builds upon their concept of *Management Groups*, *Subscriptions* and *Resource Groups*.
You typically have one (others might have more, e.g. MSPs or enterprises) Management Group+Subscription which contains all your Azure-related assets such as Entra ID (previously named Azure AD). Another example is *Conditional Access*, for which you'd typically want the *Security Administrator* role.
Within this Subscription, you can group Azure resources into Resource Groups.
Now, sadly you currently aren't able to nest Resource Groups but that's a whole different discussion, back to the topic. Resource Groups contain your actual Azure objects such as Virtual Machines, Databases, Logic Apps, Storage Accounts and more.
A small note is that users cannot exist within Resource Groups but do heavily interact with them, which makes sense if you think about it.

Every level of access abstraction has its own IAM assignments, which means you can nicely assign granular permissions up to the object level.
The only downside is that since you're often touching objects across multiple RGs and products, new users are often faced with permission issues.
And, as we're only human (for now) and want to get actual work done, people quickly resort to granting very permissive roles to their Entra accounts: Application Administrator, Security Administrator, Privileged Role Administrator, or worse: Contributor and Global Administrator.

I often do assessments for customers where I receive read-only access to their Azure tenant for audit or incident purposes.
And you'd be surprised how often those tenants contain permanent Global Administrator users, hopefully with at least an insecure method of MFA enabled.
One factor that shouldn't be forgotten as well is the fact that these things often grow *organically*, which is my favorite way of describing how things get borked over time if there's nobody present to keep applying *risk pressure* on system changes.

But, [as we've written already](/blog/gone-phishing/), identity is still a booming risk factor and growing.
Account compromise for one of those accounts is a very good threat vector for attackers to get a foothold and ransom your tenant whilst exfiltrating data
This sounds like a far-from-by-bed show, but it's actually really simple if you use an authentication method that is not phishing-resistant, such as password/(T)OTP, etc... and just get phished after a quick LinkedIn search and email lookup. (Which, ironically, is also how other people have been pestering my phone non-stop to sell their services.)
But even when using state-of-the-art authentication mechanisms such as PassKey/FIDO2, we've seen cases where attackers use more elaborate ways to just steal your session token *after* authenticating via malware. Luckily, Token Protection in Conditional Access is able to cryptographically bind user tokens to Entra-registered Windows systems but that's currently limited to a select amount of applications and I have yet to see this implemented in the wild.

So, we're stuck in a situation where people are likely to be targeted and their permissions
But luckily, there's a way to survive.

Say hello to **JIT** via **PIM**.

### Just-in-Time Access via Privileged Identity Management

Just-in-Time (JIT) ACL management is the art of only providing access when it's needed, and falling back to a least-permissive model when not.
The idea is that, in case of compromise, the attacker can't pivot using those permissions.
JIT access requests should be requested under strict security requirements and subject to peer approval.
By requiring a set of security principles to be true for a JIT request to be granted, attackers will find it hard to request (since the session will e.g. need to be protected by a set of credentials that was not possible to be sniffed) and get their request approved without the proper justification, such as an internal IT ticket. 

Within Azure ID Governance, this is possible with [Privileged Identity Management](https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure) or PIM for short.
A fun fact is that PIM could also reference [a famous cookie](https://duckduckgo.com/?q=pim+cookie&iax=images&ia=images), which led to the cookie being universally adopted by colleagues as the icon for PIM access requests.

Let's go over the seven principles of JIT via PIM. (*Doesn't that roll of the tongue?*)
Once the details have been ironed out, don't forget to create bookmarks referencing the PIM dashboard so people can request their access nicely and easily.
It's all about UX and *paved ways* so users are encouraged to do the right thing.

**1. Break glass in case of emergencies**

Using fancy Just-in-Time access is fun and all, but you should have a fallback mechanism if your JIT management system fails. And it can.
I typically recommend creating a permanent *Global Administrator* account on the Subscription level, which uses a physical security key such as a Yubikey.<br/>
If you are using a device management solution such as Intune, also requires the use of a previously-known, compliant device.
This account is -not- supposed to be used and for emergency situations only. Any usage of this account should trigger a High severity incident to the team.

I would recommend, if you're a Microsoft Sentinel or any other SIEM user, to create an alert rule akin to;

```kql
let accounts = dynamic(['internal-breakglass-01@company.com']);
SigninLogs
| where UserPrincipalName has_any (accounts)
| extend deviceDetails = parse_json(DeviceDetail)
| project TimeGenerated, Account = UserPrincipalName, Country = Location, Application = AppDisplayName, IP = IPAddress,
	CompliantDevice = deviceDetails['isCompliant'], ManagedDevice = deviceDetails['isManaged'], OS = deviceDetails['operatingSystem'], IsInteractive
; 
```

Ensure this rule fires as soon as possible (called *NRT* in Sentinel). You'll notice that this doesn't filter for *successful* authentication attempts.
Since the email address is supposed to be internal, any attempts will be good to know about.

**2. Read-only by default**

The default role for most users within your IT team, including security (*Sure, fire me for this*), should be read-only.
This is for a couple of reasons:

1. Openness to your internal team. By still providing visibility in your tenant and not locking down all access, you stimulate people to get familiar with your systems.
This might be an issue if you would have locked down everything and only gave people access to the one dashboard you think they should need.
2. An awful lot of your time is spent figuring out and clicking around compared to making changes. So you're not impacting people on the first phase of their workflow at all.
2. Foster prepared work. Since users have read-only access, they are still able to deduce a problem from your Azure tenant and come up with a hypothesis. (We think X is the issue or we need to implement Y to resolve the current ticket.)
With this hypothesis, they know now what permissions are required and can then request only these least privileged ones.

**3. Scoping is king**

Don't go about adding eligible Global Administrator permissions to everyone.

1. Scope the roles. Restrict the most permissive roles to your senior IT administrators. The use of these should be discouraged and should warrant review.
2. Scope it to Subscriptions and RGs. One team shouldn't be able to request a role on an RG that they don't use.
3. Scope the users. Keep the requestors and approvers to a minimum.

So you typically try apply PIM as much as possible where possible.
But do take a small note that you're not going to require PIM elevations for continuous tasks, e.g. SIEM work.
However, do ask yourself if some of those tasks can be automated in e.g. Logic Apps or Power Automate?

**4. Require the right context**

Using [Authentication Context](https://learn.microsoft.com/en-us/entra/identity-platform/developer-guide-conditional-access-authentication-context) in Conditional Access, you are able to require the requestor's session to be according to a set of requirements.
How it works is that in a Conditional Access you can require a set of requirements and only then *Grant* that authentication context.
Examples could be: *FIDO2 Auth Context*, *Compliant Device Context*, *Limit session lifetime*, etc...
Since we want to secure our administrative actions, you'll want a strong authentication context to be set. Create this, which is merely an empty context.
Now create a CAP to require device-bound FIDO2 authentication and a compliant device that sets this authentication context.
You can now change your PIM assignments to require this authentication context to be set.

PS: I don't think it's currently possible to require this for the approver.

**5. Ticky ticky ticky**

In the world of cloud infrastructure, we talk about the anti-pattern *ClickOps*. And this expands to your Azure environment as well.
You're highly likely performing actions using the web interface or PowerShell, which means it's impossible to track in *git* or *Terraform*.
Because of this, it's very important to do change tracking in tickets. By requiring a ticket in every PIM request, you force the requestor to document their plans and also make it much easier for the approver to decide if it's actually a good idea to do. 

**6. Automated reviews**

Ok, so you've set up this awesome system. But this sounds awfully complicated to keep track of manually.
A nice thing when you have the right license(s) within your tenant, is [Azure Access Reviews](https://learn.microsoft.com/en-us/entra/id-governance/access-reviews-overview).
This neat little solution can actually trigger automated access reviews for all your PIM roles and groups.
I typically recommend setting up quarterly or bi-yearly access reviews for your PIM role assignments and approval groups.
This ensures that any eligible or active role assignment is re-evaluated and (automagically) removed if no longer needed or used.
Once these reviews are done, the reports with actions taken are nicely presented back to you.

I also recommend expanding this to any group within your Azure tenant, including dynamic ones which means you can do fancy stuff such as triggering reviews for inactive user accounts, guests, disabled user accounts with licenses assigned, users with insecure MFA or none at all, etc.

**7. Alerting**

PIM allows you to send emails once approval has been requested, approved and assigned. This works but is very noisy and can get lost in the storm, leading to people anxiously waiting for their PIM request to get approved.
A nice workaround; you can actually use *AuditLogs* to filter for any PIM requests and then send a nudge to a Slack IT channel.

```kql
AuditLogs
| where tolower(OperationName) contains "approval requested (pim activation)"
| project TimeGenerated, Identity, Reason = ResultReason, TargetResources[0].displayName, TargetResources,
	CorrelationId = tostring(parse_json(TargetResources[0]).id)
| extend DeviceDetails = toscalar(SigninLogs| where isnotempty(CorrelationId) and CorrelationId == CorrelationId | project DeviceDetail)
| project-away CorrelationId
;
```

You'll probably also want to monitor for PIM rejections, if you should care about PIM request flooding:

```kql
AuditLogs
| where ActivityDisplayName =~'Add member to role completed (PIM activation)'
| where Result == "failure"
| extend Role = tostring(TargetResources[3].displayName), User = tostring(TargetResources[2].displayName)
| project-reorder TimeGenerated, User, Role, OperationName, Result, ResultDescription
| extend InitiatingUser = tostring(parse_json(tostring(InitiatedBy.user)).userPrincipalName)
;
```

And one to not forget, also alert on any PIM assignment changes:

```kql
AuditLogs
| where Category =~ "RoleManagement"
| where OperationName =~ "Update role setting in PIM"
| extend userPrincipalName = tostring(parse_json(tostring(InitiatedBy.user)).userPrincipalName)
| extend ipAddress = tostring(parse_json(tostring(InitiatedBy.user)).ipAddress)
| project-reorder TimeGenerated, OperationName, ResultReason, userPrincipalName, ipAddress
;
```

### Rollout Plan

Rolling this out to your tenant will require some work and coordination, but nothing you can't handle.

1. **Get a license**<br/>
Ensure you have at least one [P2](https://learn.microsoft.com/en-us/entra/id-governance/licensing-fundamentals) license in your Azure tenant to be able to use PIM.

2. **Build an IAM overview**<br/>
Try to build an overview of the current (permanent) IAM role assignments in Entra ID, *Root*, *Subscription*, *RG* and *Object* -level.<br/>
Navigate to the resource/resource group/subscription in the portal -> Access control (IAM) -> Role assignments

3. **Add the role assignments in PIM**<br/>
This will for now live next to their regular role assignments. Also don't forget;

	a. Assign to the right Entra group(s), and avoid assigning to specific users. This will facilitate access reviews.<br/>
	b. Don't forget to set the assignment to Eligible and not Active.<br/>
	c. Set their max assignment period, e.g. 1 year so you'll need to re-assign those. Or keep them permanent and use Azure Access Reviews.<br/>
	d. Set the necessary authentication context to require a compliant device and FIDO2 authentication.<br/>
	e. Set the right approver groups<br/>
	f. Lighten the notification emails<br/>

4. **Implement alerting**<br/>
Add the necessary reporting, reviews and incident detection workflows in place such as SIEM alert rules.

5. **Raise awareness**<br/>
Document and explain internally how to use PIM and what it does.
Explain that this will be the way to work very shortly and ensure everyone is aware of the seven principles.

6. **Remove permanent assignments**<br/>
Start removing permanent assignments and swapping people to Read-only assignments.

### Implementation of Azure resources

PIM can be used for Entra roles *and* Azure roles, you just need to be aware of the quirky way it's hidden in the web interface. (PIM > Manage > Azure Resources)
Once you click on that [link](https://portal.azure.com/#view/Microsoft_Azure_PIMCommon/CommonMenuBlade/~/azurerbacbrowse), you are able to select your *Management Group*.
Once this is selected, you are able to click `Manage resource` at the bottom to get to your specific PIM panel for that abstraction group.
You're of course encouraged to also select a *Subscription*, *Resource Group* and possibly even *Resource* to scope PIM down as much as possible to reduce blast radius.

An example could be that you don't want to give your senior developers permanent access to your production database, but audit access instead and give them the possibility to escalate to the *Database Administrator* role on that specific object in case of an incident, upgrades etc.

Assign your Breakglass account from earlier as permanent owner to your Azure *Subscription*, so you can move the actual users with permissive roles over to PIM.

### The power of PIM group membership

So this is cool and all, but of course only has benefits within the Azure realm. Or does it?
An often-forgotten but immensely powerful detail is that PIM actually kickstarts [SCIM](https://learn.microsoft.com/en-us/entra/architecture/sync-scim) synchronization!
A little primer for the initiates: SCIM allows you to synchronize members, member states, groups and group memberships to other software.
So would you set up SCIM between Entra ID and Slack, any enabled Entra user account would pop up as a Slack member automagically (and be disabled vice-versa).
If your SaaS software supports SCIM, you can now re-use the same groups that exist within Entra and have peace of mind that their state is reflected on both systems.

But this suffers from the same permanent permissive role problem. Or... do you see where I'm going with this?
The nice part is: if the PIM requester is part of a SCIM-managed group, Entra will automatically kick off SCIM synchronisation for those *Enterprise Applications*.
So this means that by default your users don't have to be part of an administrative group in your SaaS application, but *can* be via PIM!

And let's take this a step further, and expand this to a zTNA (VPN) provider with a broad permissions system such as [tailscale](https://tailscale.com/).
You can now even restrict web and network access to production by default, and allow developers to securely request -and approve- access.
I've tested this and had a network connection to a system within a minute of the PIM request being approved. Now who can object to those numbers?

The tailscale ACL for such a setup could look something like this:

```
{
	"postures": {
		// a recently updated macOS system
		"posture:protectedMacOS": [
			"node:os == 'macos'",
			"node:osVersion >= '14.4.1'",
			"node:tsVersion >= '1.60'"
		]
	},
	"defaultSrcPosture": [
		"posture:protectedMacOS"
	],
	"acls": [
		// Only allow access to the production network for SCIM-ed users
		{
			"action": "accept",
			"src":    ["group:oncall@company.com"],
			"dst": [
				"tag:production:*",
				"production-network:*"
			]
		},
		// Allow access to non-production by default
		{
			"action": "accept",
			"src":    ["group:developers@company.com"],
			"dst": [
				"tag:nonproduction:*",
				"nonproduction-network:*"
			]
		}
	]
}
```

And the nice part is that this reaches out to other important infrastructure providers as well, think **AWS** or **GCP**.
You could, by default, give them only read-only access to your cloud production accounts for monitoring purposes and allow them to switch to *incident* mode with write permissions after escalation, all in a secure context. Fancy!