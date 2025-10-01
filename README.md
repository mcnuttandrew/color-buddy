# "Color Buddy" an interactive color palette development tool

This is the code repo for Color Buddy. If you are looking for the app itself, you can find it [here](https://color-buddy.netlify.app/) or if you want the docs you can find them [here](https://color-buddy-docs.netlify.app/).

This repo is comprised of a monorepo that contains the following packages:

- `color-buddy-color-namer`: A library for naming colors
- `color-buddy-palette`: A library for creating and manipulating color palettes
- `color-buddy-palette-lint`: A library for linting color palettes

In addition to the packages, there are two apps:

- `apps/color-buddy`: The Color Buddy app
- `apps/docs`: The Color Buddy documentation site

Finally, there are some shared utilities in the `utils` directory and experiments, see packages directory for more details.

## SETUP (for Color Buddy App)

Install: `yarn`

This will install the deps across the monorepo.

Navigate to the app: `cd apps/color-buddy`

Run: `npx netlify dev`

Use: should point to localhost:8888 if all is well

First time you start it up there's a couple things you need to do.

1. In order to get the vega-data examples running in the app you need to run `yarn prep data`. Do this after installation from `apps/color-buddy`.

2. To get the LLM support you need to to provide LLM keys. First create a file at the root directory called ".env.development" (it should already be git ignored so don't worry). In this file you should provide keys like:

```sh
GEMINI_KEY = "YOUR KEY HERE"
OPENAI_API_KEY = "YOUR KEY HERE"
ANTHROPIC_KEY = "YOUR KEY HERE"
```

The app does not check to see if your keys work, so if you are encountering trouble (such as various auto fixes not returning content), please ensure that your keys are correct. It is not necessary to have keys for both services as the front end has an option to select which of them you wish to use (see the config menu in the upper left).

## SETUP (for Docs)

Install: `yarn`

This will install the deps across the monorepo.

Navigate to the docs: `cd apps/docs`

Run: `yarn docs:dev`

Use: should point to localhost:5147 if all is well

## Releasing

Navigate to the package you want to release. Version it as appropriate (e.g. npm version patch). Run `npm run make-build` (the npm part is important).
