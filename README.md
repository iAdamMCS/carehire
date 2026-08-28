# CareHire Docs — GitHub Pages Prototype

This repository contains the CareHire Docs clickable prototype.

## What reviewers can test

- Role and province selection
- Care-needs assessment
- Estimated weekly care hours
- Job details, schedule, and pay
- Generated job description
- Tailored interview questions
- Plain-language work agreement
- Browser voice-to-text where supported
- Text-to-speech read-back
- Print / Save as PDF

## Publishing

This repository includes a GitHub Actions workflow at `.github/workflows/pages.yml` that deploys the static prototype from `main` to GitHub Pages.

In GitHub, open **Settings → Pages** and set **Build and deployment → Source → GitHub Actions**.

After the workflow succeeds, the review site should be available at:

`https://iadammcs.github.io/carehire/`

## Updating the prototype

Update `index.html` and merge the change to `main`. GitHub Pages will redeploy automatically.

## Reviewer guide

See `REVIEWER_GUIDE.md` for the suggested test path and feedback questions.

## Important

This is a prototype for workflow and usability review. Generated employment information is illustrative and should not be treated as legal advice. Provincial and federal rules must be verified before production use.
