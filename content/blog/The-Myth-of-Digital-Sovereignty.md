+++
date = "2025-10-13T08:00:00+02:00"
title = "The Myth of Digital Sovereignty"
tags = ["EU","digital sovereignty","AWS","Google","Cloud","azure","cloud act","aws nitro","gaia","OVH","Rhea-1"]
description = "The situation of the digital sovereignty in the European Union, it's reasons and the path forward."
layout = "blog"
draft = false
+++

# EU Digital Sovereignty at Risk

## Introduction

Data sovereignty refers to the principle that data is subject to the laws of the country in which it resides.

For individuals, this subject might seem trivial—after all, everyone shares data online at their own discretion. However, the stakes increase drastically when we consider data collected by governments or public institutions. This includes medical records, financial information, and government communications.

The reality is stark: the US government can extract your Google Drive files, Apple iCloud data (without advanced data protection), OneDrive content, emails, and virtually any data stored on US-based cloud services. This isn't theoretical—it's happening today under the CLOUD Act.

Data sovereignty directly affects national security, privacy, and democratic independence. If a foreign government can access the digital data from another state, privacy becomes little more than a slogan.

In recent years, the issue has become more urgent. The CLOUD Act and the exponential growth of American tech companies, along with the scale of European data moving into these foreign infrastructures, have reignited the debate: Can Europe ever be fully independent while relying on foreign infrastructure?

## Why the EU Relies So Heavily on U.S. Tech

The cloud market was pioneered and aggressively scaled by U.S. companies like AWS, Google, and Microsoft starting in the mid-2000s. These firms built a global network of data centers before European competitors could mobilize a response. By the time European companies began developing their own cloud infrastructure and products, U.S. providers already had mature, battle-tested platforms deployed at scale. This allowed American cloud services to capture the European market early, offering superior functionality at competitive prices that local alternatives simply couldn't match.

This early-mover advantage created a self-reinforcing cycle of dominance. As billions of dollars began flowing from European customers into U.S. cloud providers, these companies channeled that revenue into expanding their services, building more data centers, and creating tightly integrated ecosystems where applications, databases, and tools work seamlessly together. This level of integration became a dealbreaker for most enterprises. European providers, lacking comparable capital, fell further behind with each passing year.

But the timing advantage alone doesn't explain the full picture. There's a deeper, systemic reason for U.S. dominance: a staggering $1.36 trillion investment gap between the U.S. and EU in ICT infrastructure and R&D accumulated between 2005 and 2022. This isn't just about one company outspending another. It reflects a fundamental difference in how capital flows into innovation. The U.S. tech sector grows at a pace the European ICT sector simply cannot match.

The disparity in venture capital allocation tells the story in stark terms: U.S. pension funds invest 1.9% of their assets in venture capital, fueling the next generation of tech companies. European pension funds? Just 0.018%, a more than hundredfold difference. This structural disadvantage in innovation financing means that even when European startups show promise, they often lack the growth capital needed to scale and compete with American giants, perpetuating Europe's dependence on U.S. technology.

## What Are U.S. Companies Putting in Place to Reassure Europe of Their Sovereignty

The biggest U.S. companies providing cloud services in Europe have come forward with their own "sovereign" solutions to try and reassure Europeans that their data is safe and remains under their control.

### Microsoft

Microsoft has launched sovereign solutions for Azure and Office365 which will ensure that all European data stays in Europe and is controlled by Microsoft employees in Europe. It will also include an encryption controller managed by the customer, meaning the cloud provider will not have the decryption key.

The architecture of the Microsoft Sovereign Solution involves data residency commitments, where data is stored exclusively in European data centers, and access controls that limit which Microsoft personnel can interact with the data.

### Amazon Web Services (AWS)

AWS is about to launch its version of a dedicated cloud for Europe with infrastructure and personnel from Europe having access to and control of the data stored in Europe.

### Oracle

Oracle is also launching EU Sovereign Cloud, claiming it will be a completely separate entity from Oracle US. All data will be stored and controlled in Europe.

All these initiatives show that U.S. companies are trying to make a real move toward clouds for Europe in Europe, independent of any external control.

One way U.S. companies could provide Europe with their cloud solutions while giving sovereignty would be by handing over all encryption keys to the customer and not having access to any. This means that only the customer would be able to decrypt the data, and if the cloud provider has to hand over data to the U.S. government, they would hand over something that is unreadable.

## The Legal Reality: Jurisdiction Beats Geography

All these initiatives share one fundamental flaw: under the CLOUD Act, geography doesn't matter. Jurisdiction does.

No matter where the data resides, as long as it is stored on hardware owned by an American company or one of its subsidiaries, that data falls under U.S. jurisdiction. If the U.S. government requests access, the company is legally bound to comply or face severe consequences such as heavy fines, loss of federal contracts, or even exclusion from doing business in the United States.

Even Microsoft admitted before the French Senate that it could not guarantee that, if the U.S. government demanded access to data belonging to French citizens and stored in France, it would be able to block that request.

Microsoft claims that such a request would need to be "legitimate." But how much trust can Europe really place in a company whose ultimate goal is to maximize profit, and whose current leadership, while perhaps law-abiding today, could one day change?

What happens if the United States drifts further toward an authoritarian state, and someone less concerned with legal boundaries takes control of Microsoft? Who will then guarantee that European data remains protected and only accessed under legitimate circumstances?

## When Even Hardware Isn't Safe

The sovereignty problem doesn't stop at "Who has access to my data?" It also relies on the security of the hardware it's stored on.

A recent study by KU Leuven and the University of Birmingham has shown a critical flaw in Intel's and AMD's processor chips, allowing anyone with physical access to the server to steal data in an almost invisible way.

These findings demonstrate that technical sovereignty can be as fragile as legal sovereignty. If the underlying hardware designed by non-European manufacturers contains fatal flaws, then even data hosted in European data centers by European companies can be at risk.

Some U.S. cloud providers have introduced confidential computing technologies like AWS Nitro Enclaves, which create isolated execution environments where even the cloud provider cannot access the data. However, these technologies don't solve the fundamental jurisdiction problem. While AWS cannot technically access data inside a Nitro Enclave, the CLOUD Act requires legal compliance, not technical impossibility. If the U.S. government demands access, AWS would be legally obligated to provide whatever access it can, including shutting down the enclave or providing encryption keys if they exist.

In other words, we can't simply push for European data centers to be built and European companies to run them. We also need to push for the manufacturing of CPUs and GPUs made in Europe, for Europe to hold the complete supply chain.

## The Dilemma and Path Forward

Europe faces a double dilemma. It relies on foreign infrastructure on one side and foreign hardware on the other, both of which undermine Europe's ambition to be fully digitally sovereign.

The technological advancement gap between Silicon Valley and Europe compounds this problem. While Silicon Valley thrives on a culture of rapid innovation, risk-taking, and massive venture capital investment, Europe's approach remains more cautious and fragmented. In 2023, the U.S. invested approximately €62.5 billion in artificial intelligence alone, while Europe attracted only around €9 billion. This disparity isn't just about money, it reflects fundamentally different attitudes toward innovation, failure, and scaling.

Some initiatives are emerging, like the supercomputer chip Rhea-1 developed in France by SiPearl, OVHCloud Sovereign Solution, and NumSpot, another European cloud provider. Yet these initiatives can't yet compete with the giants like Google, Microsoft, or Amazon. Another problem is how slowly European companies are trying to create competitors. This change is coming too slowly to become a real alternative to U.S. tech.

To change this, Europe must:

- Invest in European companies developing products that aim to make Europe more sovereign.
- Establish a strict legal framework ensuring that data held by public institutions cannot fall under foreign jurisdiction.
- Develop native infrastructure like large-scale data centers powered by European hardware.

## Conclusion

European digital sovereignty is being challenged at every level. The legal reach of the CLOUD Act, the dominance of American tech giants, and the vulnerabilities in hardware manufactured outside Europe reveal one thing: Europe has no control over its cloud infrastructure.

If Europe wants to really become digitally independent from the U.S. and China, it should invest in building a truly independent digital foundation.

Without such an effort, Europe will continue to entrust its most sensitive data to foreign powers, exposing itself to geopolitical risks and the erosion of trust that comes with dependency.

## Sources

- https://datanews.levif.be/actualite/securite/failles/des-chercheurs-de-la-ku-leuven-piratent-la-securite-cloud-avancee-dintel-et-damd/
- https://www.oracle.com/a/ocom/docs/cloud/oracle-eu-sovereign-cloud-for-fusion-apps-datasheet.pdf
- https://www.forbes.com/sites/emmawoollacott/2025/07/22/microsoft-cant-keep-eu-data-safe-from-us-authorities/
- https://www.theregister.com/2025/08/04/when_hyperscalers_cant_safeguard_one/
- https://news.microsoft.com/source/emea/2025/04/nouveaux-engagements-europe-cybersecurite-microsoft/?lang=fr
- https://www.lebigdata.fr/confidential-computing-2
- https://learn.microsoft.com/fr-fr/azure/confidential-computing/overview
- https://www.politico.eu/article/data-tech-google-taxes-buying-habits-produce-eu-uk-us-microsoft/
- https://www.lesnumeriques.com/cpu-processeur/rhea-1-ce-processeur-europeen-concu-en-france-relance-la-bataille-des-puces-face-aux-etats-unis-et-a-la-chine-n239589.html
- https://docs.aws.amazon.com/enclaves/latest/user/nitro-enclave.html
