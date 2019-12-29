ironpeak.be
===========

This is the repository that builds the static website for [ironpeak.be](https://ironpeak.be/) using [hugo](https://gohugo.io/).

Current build status:
[![Netlify Status](https://api.netlify.com/api/v1/badges/55df448b-0cad-4bc9-bf27-50b65531eea1/deploy-status)](https://app.netlify.com/sites/ironpeakbe/deploys)
[![codebeat badge](https://codebeat.co/badges/3aff50cc-c4c2-48c9-9a4d-a98dcc39ddbd)](https://codebeat.co/projects/github-com-ironpeakservices-ironpeak-be-master)

Slides
-------
If you are looking for the presentation slides I gave somewhere, look in the [static/slides/](static/slides/) directory.

CI / CD
-------
The pipeline runs on a free instance of [Netlify](https://www.netlify.com/), since this supports setting security headers compared to Github Pages.

Building
--------
`hugo server` to run locally, `hugo --gc --minify` to build minified output to `generated/`.
