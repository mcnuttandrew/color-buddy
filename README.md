# "Color Buddy" an interactive color palette development tool

This is the code repo for Color Buddy. You can see docs for the language in the public/lang-docs.md file.

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
OPENAI_API_KEY = "YOUR KEY HERE"
GEMINI_KEY = "YOUR KEY HERE"
ANTHROPIC_KEY = "YOUR KEY HERE"
```

The app does not check to see if your keys work, so if you are encountering trouble (such as various auto fixes not returning content), please ensure that your keys are correct. It is not necessary to have keys for both services as the front end has an option to select which of them you wish to use (see the config menu in the upper left).

## SETUP (for Docs)

Install: `yarn`

This will install the deps across the monorepo.

Navigate to the docs: `cd apps/docs`

Run: `yarn docs:dev`

Use: should point to localhost:5147 if all is well
