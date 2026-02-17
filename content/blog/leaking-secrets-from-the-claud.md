+++
date = "2026-02-17T10:00:00+01:00"
title = "Leaking secrets from the claud"
tags = ["ai","security","secrets","github","claude","cursor","credentials","supply-chain"]
description = "How AI coding assistants are causing developers to leak credentials to public GitHub repositories and what you can do about it."
layout = "blog"
draft = false
+++

**AI coding assistants are the new hotness. Claude Code, Cursor, Continue, Copilot, you name it. Developers are adopting them faster than you can say *autocomplete*. But here's the thing nobody's talking about: these tools create local configuration directories that are silently accumulating secrets. And developers are pushing them straight to public GitHub repositories. Cue nervous laughter. Let me show you just how bad it is and what you can do about it.**

### The problem

If you've used any AI coding assistant recently, you've probably noticed directories like `.claude/`, `.cursor/` or `.continue/` popping up in your project root. These directories store tool configurations, conversation history, project context and sometimes even inline instructions that reference sensitive values. Think API keys, database connection strings, internal URLs and cloud credentials.

Now, most seasoned developers have `.env` drilled into their `.gitignore` muscle memory. But these AI config directories? They're new. They don't show up in the typical *things you should never commit* checklists (yet). And since these tools often generate or reference credentials as part of their context, you end up with secrets embedded in places you'd never think to look.

The result? Developers are unknowingly shipping credentials to public repositories.

### How bad is it?

Spoiler: worse than you'd think.

I wrote a tool called [claudleak](https://github.com/hazcod/claudleak) to find out. It scans public GitHub repositories for AI coding tool configuration files and then runs [TruffleHog](https://github.com/trufflesecurity/trufflehog) against those paths to detect exposed secrets.

Scanning just 100 repositories already turns up verified API keys and database credentials. Roughly **2.4%** of repositories containing AI tool configuration directories have sensitive information in their history. That might sound low, but considering the sheer volume of public repositories on GitHub, we're talking about a significant amount of exposed credentials out in the wild.

And remember, these are *verified* findings. Not just high-entropy strings that might be secrets, but credentials that have been confirmed to actually be valid.

### How it works

You could just run [TruffleHog](https://github.com/trufflesecurity/trufflehog) on a repository yourself, but that scans everything and gives you a pile of results to wade through. Claudleak is more targeted than that. It first searches GitHub for repositories that actually contain AI tool config directories such as `.claude/`, `.cursor/` and `.continue/`, so you're not wasting time on repos that don't have them. It then clones each match and scans specifically those paths, including the full git history where developers might have removed the files but forgot that git never forgets. Results are presented as a table or JSON.

A simple scan looks like this:

```shell
claudleak --token $GITHUB_TOKEN --max-repos 100 --verified-only
```

Want to audit your own organization? Easy:

```shell
claudleak --org your-company --verified-only --json --output results.json
```

The tool is written in Go, open-source, and takes about three minutes to surface findings. Not bad for a quick sanity check on your org's public exposure. And for the bug bounty hunters out there: you're welcome.

### How I found out

I was happily using Claude Code for my own projects, key-bashing my way through permission prompts and whitelisting commands left and right. You know the drill. The tool asks you to approve a command, you glance at it for half a second and hit allow. Rinse and repeat.

It wasn't until afterwards that I noticed something unpleasant: I had committed a `.claude/settings.local.json` file to my repository. And that file? It contained all my whitelisted commands, complete with the secrets I had passed as environment variables. Database passwords, API keys, the lot. Sitting right there in my git history for anyone to find.

That was my *oh no* moment. If this happened to me, someone who thinks about security for a living, how many other developers are doing the exact same thing without ever realizing it?

### Why this happens

The root cause is deceptively simple: developers don't know these directories can contain secrets, and the AI tools themselves don't always warn you about it.

Here's the typical flow:

1. Developer installs an AI coding assistant
2. The tool creates a local config directory in the project root
3. During usage, credentials end up in whitelisted commands, conversation context, project instructions or tool configuration
4. Developer runs `git add .` or `git add -A`, a habit as old as git itself
5. The AI config directory gets committed and pushed

Some of these tools even encourage you to commit their config directories to share project context with your team. Ring a bell? While that's useful for non-sensitive configuration, it creates a dangerous habit of treating these directories as safe to commit.

### What you should do

The fix is straightforward. Add AI tool configuration directories to your `.gitignore`. Today. Right now. Go do it.

```
# AI coding assistant directories
.claude/
.cursor/
.continue/
.copilot/
.aider/
```

But don't stop there:

**1. Audit your existing repositories**

Run claudleak against your organization to check if you've already leaked something. If you have, rotate those credentials immediately.

**2. Use a global gitignore**

Set up a global gitignore file so these directories are excluded from every repository on your machine by default, not just the ones where you remember to add it.

```shell
echo ".claude/\n.cursor/\n.continue/" >> ~/.gitignore_global
git config --global core.excludesfile ~/.gitignore_global
```

**3. Add a pre-commit hook**

Use a [pre-commit](https://pre-commit.com/) hook to reject any commits that include AI tool directories. This way, even if you forget to update your `.gitignore`, the commit won't go through. A simple `check-added-large-files` or custom hook that blocks `.claude/`, `.cursor/` and `.continue/` paths will do the trick.

**4. Scan in CI**

Consider running secret scanning tools like TruffleHog or [gitleaks](https://github.com/gitleaks/gitleaks) in your CI pipeline to catch any secrets before they make it to your remote.

**5. Scrub your history**

If you've already committed secrets, removing them from the latest commit isn't enough. They're still in your git history. Use tools like [git-filter-repo](https://github.com/newren/git-filter-repo) or [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) to purge them properly.

### Takeaways

AI coding tools are incredibly powerful, but they come with a new class of security hygiene that most developers aren't aware of yet. The directories these tools create are not inherently dangerous, but the habits around committing everything and the tendency for sensitive values to end up in AI context make for a risky combination.

Don't wait until your cloud credentials show up on a paste site. Add those directories to your `.gitignore`, audit your repositories and rotate anything that's been exposed. Three minutes of work now can save you from a very unpleasant incident later.

The tool is open-source and available at [github.com/hazcod/claudleak](https://github.com/hazcod/claudleak). Give it a spin.
