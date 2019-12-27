+++
date = "2019-07-11T21:27:56+02:00"
title = "Ironing out Docker"
description = "Let me take you for a deep dive into typical Docker setups and show you where we can easily trim down our attack surface drastically by looking at it from a full stack perspective. Buckle up boys!"
layout = "blog"
draft = "true"
+++

**Let me take you for a deep dive into typical Docker setups and show you where we can easily trim down our attack surface drastically by looking at it from a full stack perspective. Buckle up boys!**

# > Ironing out Docker

## $ tree
In this blog post, we'll be talking about four main categories: *the user*, *the Docker host*, the *container image* and the *container metadata*. Our user principle will be you or any other administrator/developer/sysadmin that will be applying changes to your infrastructure. The Docker host will be your baremetal and/or virtual machine that runs the Docker daemon and possibly other processes. Your container image contains your application code and will be deployed anywhere you want it. And finally, the way we deploy our container image and how it will & can behave will be described in the container metadata.

## $ docker: command not found
For those that have been living under a rock for the past few years, get ready for a super fast crash cource into Docker!<br/>
*Psst! For the awesome BSD people reading this using lynx, Docker is like jails on steroids.*

Docker is a drastic shift in how we develop, deploy and manage our application. Before Docker, people would typically setup a server once and upload their application code hoping they still have a relevant config setup on their machine. But what about all the libraries, operating system version or even redeploying your code on a new server? Salstack, Chef or Pupper help in this to some regard, but don't cover the whole spectrum. Oh, and did I mention it's open source and written in Go? Enter Docker!

Docker is an ecosystem (it consists of the *Docker daemon*, *runc* runtime and several tools.
It allows a developer to package up an application with all the parts it needs (operating system, libraries, configuration, ...) in an uniform and expendable way and make it available as a single, layered package. Think of it like a virtual machine, but without all the unnecessary bloat and a shared linux kernel. This can go really far, in fact several of my containers only consist the shared linux kernel and a single binary! This makes for *very* fast deployments. Because we are now packaging our application into a single unit, we can configure all of our containers in an uniform way via environment variables. In the [The Twelve-Factor App](https://12factor.net/) methodology (which is basically the container bible), twelve commandments dictate what a container should adhere to. I really recommend you to go through them and get used to the whole idea.

## $ the user
Yes, this is the one time that you can
