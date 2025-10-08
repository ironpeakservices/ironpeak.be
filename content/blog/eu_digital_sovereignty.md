# EU Digital Sovereignty at Risk

## Introduction

Data sovereignty refers to the principle that data is subject to the laws of the country in which it resides.

For individuals, this subject might seem trivial, after all, everyone shares data online at their own discretion. However, the stakes increase drastically when we consider data collected by governments or public institutions. This includes medical records, financial information, and government communications.

Data sovereignty directly affects national security, privacy, and democratic independence. If a foreign government can access digital data from another state, privacy becomes little more than a slogan.

In recent years, the issue has become more urgent. The CLOUD Act and the exponential growth of American tech companies, combined with the scale of European data moving into foreign infrastructures, have reignited the debate: Can Europe ever be fully independent while relying on foreign infrastructure?

## Why EU relies so heavily on U.S. tech

The cloud market was pioneered and aggressively scaled by U.S. companies, AWS, Google, and Microsoft, starting in the mid-2000s. These firms built a global network of data centers before European competitors could mobilize a response. By the time European companies began developing their own cloud infrastructure and products, U.S. providers already had mature, battle-tested platforms deployed at scale. This allowed American cloud services to capture the European market early, offering superior functionality at competitive prices that local alternatives simply couldn't match.

This early-mover advantage created a self-reinforcing cycle of dominance. As billions of dollars began flowing from European customers into U.S. cloud providers, these companies channeled that revenue into expanding their services, building more data centers, and creating tightly integrated ecosystems where applications, databases, and tools work seamlessly together, a level of integration that became a dealbreaker for most enterprises. European providers, lacking comparable capital, fell further behind with each passing year.

But the timing advantage alone doesn't explain the full picture. There's a deeper, systemic reason for U.S. dominance: a staggering $1.36 trillion investment gap between the U.S. and EU in ICT infrastructure and R&D accumulated between 2005 and 2022. This isn't just about one company outspending another, it reflects a fundamental difference in how capital flows into innovation. The U.S. tech sector grows at a pace the European ICT sector simply cannot match.

The disparity in venture capital allocation tells the story in stark terms: U.S. pension funds invest 1.9% of their assets in venture capital, fueling the next generation of tech companies. European pension funds? Just 0.018%, more than a hundredfold difference. This structural disadvantage in innovation financing means that even when European startups show promise, they often lack the growth capital needed to scale and compete with American giants, perpetuating Europe's dependence on U.S. technology.

Beyond pure capital, Silicon Valley has built an ecosystem Europe struggles to replicate. The concentration of top-tier research institutions, a culture that celebrates risk-taking and tolerates failure, and tight integration between academia and industry create an innovation engine that compounds its advantages year after year. European tech hubs, while growing, still lack this interconnected infrastructure, making it difficult to match the pace of advancement in cloud computing, AI, and semiconductor design.

## What are US companies putting in place to reassure Europe of their sovereignty

The biggest US companies providing cloud services in Europe have come forward with their own "sovereign" solutions to try and reassure Europeans that their data is safe and remains under their control. On paper, these initiatives offer an appealing compromise: keep using the powerful platforms everyone already depends on, just with European guarantees. But the reality is more complicated.

### Microsoft

Microsoft has launched sovereign solutions, including Microsoft Cloud for Sovereignty and specific offerings for Azure and Office 365, which ensure that all European data stays in Europe and is controlled by Microsoft employees based in Europe. The architecture includes customer-managed encryption keys, meaning the cloud provider does not have the decryption key, theoretically giving customers exclusive control over their data.

Data residency commitments promise that information never leaves European data centers, with access controls limiting which Microsoft personnel can interact with that data. But the fundamental question remains: does controlling the encryption key truly protect data when the underlying infrastructure and legal obligations remain unchanged?

### Amazon Web Services (AWS)

Amazon Web Services (AWS) is launching its AWS European Sovereign Cloud, a dedicated infrastructure for Europe. The system uses hardware supplied to European data centers, with infrastructure and personnel from Europe having access to and control of the data stored within. Updates and maintenance are handled through isolated European operations, creating what appears to be an air gap between U.S. and European systems.

AWS also offers Nitro instances with confidential computing capabilities, using hardware-level encryption to protect data even from the cloud provider itself during processing. These technical safeguards sound impressive, but they exist within a legal framework that may override even the strongest technical protections.

### Oracle

Oracle is also launching an EU Sovereign Cloud, claiming it will be a completely separate entity from Oracle US. All data will be stored and controlled in Europe, with organizational separation as a key differentiator.

All these initiatives show that US companies are attempting to demonstrate a genuine move toward European clouds that are independent of any external control. The promise is simple: European control with American technology. But does that actually work?

## The legal reality, Jurisdiction beats Geography

All these initiatives share one fundamental flaw: under the CLOUD Act, geography doesn't matter, jurisdiction does.

No matter where the data resides, as long as it is stored on hardware owned by an American company or one of its subsidiaries, or under the "possession, custody, or control" of a U.S. entity, that data falls under U.S. jurisdiction. If the U.S. government requests access, the company is legally bound to comply, or face severe consequences such as heavy fines, loss of federal contracts, or even exclusion from doing business in the United States.

The "possession, custody, or control" language creates complex scenarios. Consider Google Cloud Platform data centers operated by Thales in France. Even if Thales owns or leases the hardware, if the data is accessed through GCP infrastructure or managed through Google's systems, it could still fall under the CLOUD Act. The question isn't simply "who owns the hardware?" but rather "who controls the platform?"

Even Microsoft admitted before the French Senate that it could not guarantee that, if the U.S. government demanded access to data belonging to French citizens and stored in France, it would be able to block that request.

Microsoft claims that such a request would need to be "legitimate." But how much trust can Europe really place in a company whose ultimate goal is to maximize profit, and whose current leadership, while perhaps law-abiding today, could one day change?

What happens if the United States drifts (more) toward an authoritarian state, and someone less concerned with legal boundaries takes control of Microsoft? Who will then guarantee that European data remains protected and only accessed under legitimate circumstances?

## When even hardware isn't safe

The sovereignty problem does not stop at "Who has access to my data?" but also relies on the security of the hardware on which it is stored.

A recent study by KU Leuven and the University of Birmingham has shown a critical flaw in Intel's and AMD's processor chips, allowing any person with physical access to the server to steal data in an almost invisible way.

Imagine this scenario: A European company stores sensitive data on what they believe is a secure, encrypted cloud instance in a U.S. data center. An attacker gains physical access to the server, perhaps as a data center technician or through social engineering. Using the Intel/AMD vulnerability, they extract encryption keys directly from the processor during operation, bypassing all software-level security measures. The data is exfiltrated without triggering any alerts. The breach remains undetected. This isn't theoretical, these vulnerabilities demonstrate that even confidential computing solutions like AWS Nitro, while providing strong protections, have limitations when fundamental hardware flaws exist.

These findings demonstrate that technical sovereignty can be as fragile as legal sovereignty. If the underlying hardware designed by non-European manufacturers contains fatal flaws, then even data hosted on European data centers by European companies can be at risk.

In other words, Europe cannot simply push for European data centers and European companies to run them. Europe also needs to push for the manufacturing of CPUs and GPUs made in Europe, so that Europe holds the complete supply chain.

## The dilemma and path forward

Europe faces a double dilemma: it relies on foreign infrastructure on one side and on foreign hardware on the other side, both of which undermine Europe's ambition to be fully digitally sovereign.

Some initiatives are emerging, such as the Rhea-1 supercomputer chip developed in France by SiPearl, OVHCloud's Sovereign Solution, and NumSpot, another European cloud provider. The European Cloud Initiative is also in development, though its progress has been slow and faces significant funding and coordination challenges across member states. Yet these initiatives cannot yet compete with giants like Google, Microsoft, or Amazon.

To change this, Europe must:

- **Invest in European companies** developing products aimed at making Europe more sovereign. This requires not just funding, but creating an ecosystem that can rival Silicon Valley's innovation culture, one that combines academic excellence, venture capital, and tolerance for calculated risks.
- **Establish a strict legal framework** ensuring that data held by public institutions cannot fall under foreign jurisdiction.
- **Develop native infrastructure**, such as large-scale data centers powered by European hardware.

## Conclusion

European digital sovereignty is being challenged at every level. The legal reach of the CLOUD Act, the dominance of American tech giants, and the vulnerabilities in hardware manufactured outside Europe reveal one thing: Europe has no control over anything when it comes to cloud infrastructure.

If Europe wants to become truly digitally independent from the U.S. and China, it should invest in building a truly independent digital foundation.

Without such an effort, Europe will continue to entrust its most sensitive data to foreign powers, exposing itself to geopolitical risks and the erosion of trust that comes with dependency.

## Sources

### CLOUD Act and Legal Jurisdiction
- Inside Privacy - "Reaching for the CLOUD" (July 2021): https://www.insideprivacy.com/surveillance-law-enforcement-access/reaching-for-the-cloud/
- Cross-Border Data Forum - "Defining the Scope of 'Possession, Custody, or Control' for Privacy Issues and the Cloud Act": https://www.crossborderdataforum.org/defining-the-scope-of-possession-custody-or-control-for-privacy-issues-and-the-cloud-act/
- Cross-Border Data Forum - "Frequently Asked Questions about the U.S. CLOUD Act": https://www.crossborderdataforum.org/cloudactfaqs/
- BSA - "The US CLOUD Act: Myths vs. Facts" (April 2019): https://www.bsa.org/files/policy-filings/04112019uscloudactmyth.pdf
- Congress.gov - "Law Enforcement Access to Overseas Data Under the CLOUD Act": https://www.congress.gov/crs-product/LSB10125

### Cloud Market Dominance and Early Mover Advantage
- CB Insights - "Cloud Wars: The Rivalry Between Amazon, Microsoft, and Google" (January 2022): https://www.cbinsights.com/research/amazon-google-microsoft-multi-cloud-strategies/
- DuploCloud - "Cloud Wars Heats Up: Amazon's Lead, Microsoft's Lag, Google's Growth" (March 2025): https://duplocloud.com/blog/helpful-resources/cloud-wars-heats-up-amazons-lead-microsofts-lag-googles-growth/
- Emma - "Cloud Market Share Trends to Watch in 2025": https://www.emma.ms/blog/cloud-market-share-trends
- CIO Dive - "Cloud market makeup entrenched as AWS holds lead" (May 2022): https://www.ciodive.com/news/aws-microsoft-google-cloud-market-share/623004/
- InfoWorld - "Why AWS leads in the cloud" (November 2020): https://www.infoworld.com/article/2261228/why-aws-leads-in-the-cloud.html

### EU-US Investment Gap
- ECIPE - "The EU's Trillion Dollar Gap in ICT and Cloud Computing Capacities": https://ecipe.org/publications/eu-gap-ict-and-cloud-computing/
- ECIPE - "ICT Beyond Borders: The Integral Role of US Tech in Europe's Digital Economy": https://ecipe.org/publications/the-role-of-us-tech-in-europes-digital-economy/
- CELIS Institute - "The Role of US Investments for EU Technology Sovereignty": https://www.celis.institute/celis-blog/the-role-of-us-investments-for-eu-technology-sovereignty/

### Venture Capital Disparity
- Jacques Delors Centre - "Europe ventures forward: Getting the scaleup of cleantech": https://www.delorscentre.eu/en/publications/detail/publication/venture-capital-getting-the-scaleup-of-cleantech-right
- CEPS - "It's finally time to leverage pension funds to foster EU productivity" (February 2025): https://www.ceps.eu/its-finally-time-to-leverage-pension-funds-to-foster-eu-productivity-and-benefit-pensioners/
- IMF Working Paper - "Stepping Up Venture Capital to Finance Innovation in Europe" (2024): https://www.imf.org/-/media/Files/Publications/WP/2024/English/wpiea2024146-print-pdf.ashx
- State of European Tech 2021: https://2021.stateofeuropeantech.com/chapter/attracting-world-class-investors/article/fundraising/

### Microsoft Sovereign Cloud Solutions
- Microsoft Official Blog - "Announcing comprehensive sovereign solutions empowering European organizations" (June 2025): https://blogs.microsoft.com/blog/2025/06/16/announcing-comprehensive-sovereign-solutions-empowering-european-organizations/
- Microsoft Learn - "Use customer-managed Keys for encryption in Microsoft for Sovereignty": https://learn.microsoft.com/en-us/industry/sovereignty/customer-managed-keys
- Microsoft - "Discover Microsoft Sovereign Cloud": https://www.microsoft.com/en-us/industry/sovereignty/cloud
- Microsoft Official Blog - "Microsoft Cloud for Sovereignty" (July 2022): https://blogs.microsoft.com/blog/2022/07/19/microsoft-cloud-for-sovereignty-the-most-flexible-and-comprehensive-solution-for-digital-sovereignty/
- CIO - "How sovereign is Microsoft Sovereign Cloud really?" (June 2025): https://www.cio.com/article/4009314/how-sovereign-is-microsofts-sovereign-cloud-really.html
- Forbes - "Microsoft Can't Keep EU Data Safe From US Authorities" (July 2025): https://www.forbes.com/sites/emmawoollacott/2025/07/22/microsoft-cant-keep-eu-data-safe-from-us-authorities/

### AWS European Sovereign Cloud
- AWS Security Blog - "Establishing a European trust service provider for the AWS European Sovereign Cloud" (August 2025): https://aws.amazon.com/blogs/security/establishing-a-european-trust-service-provider-for-the-aws-european-sovereign-cloud/
- About Amazon EU - "AWS European Sovereign Cloud to be operated by EU citizens" (August 2025): https://www.aboutamazon.eu/news/aws/aws-european-sovereign-cloud-to-be-operated-by-eu-citizens
- AWS Security Blog - "AWS plans to invest €7.8B into the AWS European Sovereign Cloud" (September 2025): https://aws.amazon.com/blogs/security/aws-plans-to-invest-e7-8b-into-the-aws-european-sovereign-cloud-set-to-launch-by-the-end-of-2025/
- Eliatra - "The Sovereignty Illusion: Why AWS's European Cloud Cannot Escape US Jurisdiction" (June 2025): https://eliatra.com/blog/the-sovereignty-illusion-why-awss-european-cloud-cannot-escape-us/

### Oracle EU Sovereign Cloud
- Oracle - "EU Sovereign Cloud": https://www.oracle.com/cloud/eu-sovereign-cloud/
- Oracle Docs - "Learn about the Oracle European Union Sovereign Cloud": https://docs.oracle.com/en/solutions/learn-about-eusc/index.html
- Oracle Blog - "Offering a sovereign cloud designed for the European Union": https://blogs.oracle.com/cloud-infrastructure/post/offering-a-sovereign-cloud-designed-for-the-european-union
- CIO - "Oracle's new EU Sovereign Cloud regions" (May 2025): https://www.cio.com/article/641703/oracles-new-eu-sovereign-cloud-regions-to-help-enterprises-meet-data-regulations.html
- TechCrunch - "Oracle launches its 'sovereign cloud' for EU customers" (June 2023): https://techcrunch.com/2023/06/20/oracle-launches-its-sovereign-cloud-for-eu-customers/

### Hardware Vulnerabilities (Intel/AMD)
- KU Leuven News - "KU Leuven research exposes fundamental hardware flaw in highly protected cloud servers" (2025): https://nieuws.kuleuven.be/en/content/2025/kuleuven-research-cosic-distrinet-exposes-fundamental-hardware-flaw
- KU Leuven News - "International research team uncovers vulnerability in cloud server security" (2024): https://nieuws.kuleuven.be/en/content/2024/vulnerability-in-cloud-server-security-badram
- The Hacker News - "New $50 Battering RAM Attack Breaks Intel and AMD Cloud Security Protections" (October 2025): https://thehackernews.com/2025/10/50-battering-ram-attack-breaks-intel.html
- Dark Reading - "A $50 'Battering RAM' Can Bust Confidential Computing" (October 2025): https://www.darkreading.com/cloud-security/50-battering-ram-bust-confidential-computing

### SiPearl Rhea-1 Processor
- SiPearl Official Website: https://sipearl.com/
- Data Center Dynamics - "SiPearl announces updated specifications for delayed Rhea-1 processors" (May 2024): https://www.datacenterdynamics.com/en/news/sipearl-announces-updated-specifications-for-delayed-rhea-1-processors/
- EE Times Europe - "SiPearl Tapes Out Rhea1 CPU, Closes Series A, Preps Series B" (July 2025): https://www.eetimes.eu/sipearl-tapes-out-rhea1-processor-closes-series-a-preps-series-b/
- The Next Platform - "With Money And Rhea1 Tapeout, SiPearl Gets Real About HPC CPUs" (July 2025): https://www.nextplatform.com/2025/07/09/with-money-and-rhea1-tapeout-sipearl-gets-real-about-hpc-cpus/
- The Register - "SiPearl finally tapes out Rhea1 supercomputer chip" (July 2025): https://www.theregister.com/2025/07/09/sipearl_rhea1_tape_out/

### OVHCloud
- OVHCloud - "Trusted Sovereign Cloud": https://www.ovhcloud.com/en/about-us/sovereign-cloud/
- OVHCloud Corporate - "DEEP and OVHcloud launch partnership to strengthen European strategic autonomy" (March 2025): https://corporate.ovhcloud.com/en/newsroom/news/deep-ovhcloud-launch-partnership-luxembourg/
- OVHCloud - "What is Sovereign Cloud?": https://www.ovhcloud.com/en/learn/what-is-sovereign-cloud/
- Data Center Dynamics - "OVH and Luxembourg Post to launch sovereign cloud offering" (April 2025): https://www.datacenterdynamics.com/en/news/ovh-and-luxembourg-post-to-launch-sovereign-cloud-offering/

### NumSpot
- CISPE - "Sovereign Cloud Providers Numspot and Infomaniak Join CISPE" (June 2025): https://www.cispe.cloud/sovereign-cloud-providers-numspot-and-infomaniak-join-cispe/
- NumSpot - "About us": https://numspot.com/en/about-us/
- Dassault Systèmes - "Docaposte, Dassault Systèmes, Bouygues Telecom and Banque des Territoires sign alliance" (October 2022): https://www.3ds.com/newsroom/press-releases/docaposte-dassault-systemes-bouygues-telecom-and-banque-des-territoires-sign-alliance-offer-reference-solution-trusted-cloud-services

### GAIA-X and European Cloud Initiatives
- GAIA-X Official Website: https://gaia-x.eu/
- Taylor & Francis Online - "European ambitions captured by American clouds: digital sovereignty through Gaia-X?" (June 2025): https://www.tandfonline.com/doi/full/10.1080/1369118X.2025.2516545
- Polytechnique Insights - "Gaia-X: the bid for a sovereign European cloud" (June 2025): https://www.polytechnique-insights.com/en/columns/digital/gaia-x-the-bid-for-a-sovereign-european-cloud/
- Leiden Law Blog - "GAIA-X: Europe's values-based counter to U.S. cloud dominance": https://www.leidenlawblog.nl/articles/gaia-x-europes-values-based-counter-to-u-s-cloud-dominance
- Data Center Dynamics - "Gaia-X: Has Europe's grand digital infrastructure project hit the buffers?" (May 2024): https://www.datacenterdynamics.com/en/analysis/gaia-x-has-europes-grand-digital-infrastructure-project-hit-the-buffers/
