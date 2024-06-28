# Palette Lint

Have you ever looked closely at a color palette and wondered if it was a good palette or just the one you had? Palette Lint is a tool that helps you evaluate the quality of a color palette. It operates analogously to a spell checker (or more closely, like a linter), but for color palettes. It will help you identify issues with your palette and suggest improvements.

Palette lint exports the following packages:

```ts
export {
  // a collection of pre built lints, see https://color-buddy-docs.netlify.app/lang-examples.html for more details
  PREBUILT_LINTS,
  // The linter class that is used to lint a palette
  ColorLint,
  // a Function that creates a custom lint from
  CreateCustomLint,
  colorNameSimple,
  generateMCFix,
  linter,
  simulateCVD,
  suggestLintFix,
};
export type {
  Palette,
  StringPalette,
  ColorWrap,
  LintResult,
  CustomLint,
  ColorSpace,
};
```

Example usage todo! For now see the test files for examples.

## Contents

This library contains the following functions:

### CreateCustomLint
**Function**: `CreateCustomLint(props: CustomLint) => typeof CustomLint`



### generateMCFix
**Function**: `generateMCFix(palette: Palette, lints: CustomLint[]) => Palette`



### linter
**Function**: `linter(palette: Palette, customLints: CustomLint[]) => ColorLint<any>[]`



### simulateCVD
**Function**: `simulateCVD(deficiency: string, color: Color) => Color`



### suggestLintFix
**Function**: `suggestLintFix(palette: Palette, lint: LintResult, _engine: string) => Promise<Palette[]>`





This library contains the following classes:

### ColorLint

**Class**: `ColorLint`

Constructor:
**Constructor**: `constructor(ConstructorSignature new ColorLint<CheckData>: ColorLint<CheckData>)`

Properties:
**Property** blameMode: "none" | "single" | "pair" 
**Property** checkData: CheckData 
**Property** description: string 
**Property** group: "design" | "accessibility" | "usability" | "custom" 
**Property** id: undefined | string 
**Property** isCustom: string | false 
**Property** level: "error" | "warning" 
**Property** message: string 
**Property** name: string 
**Property** naturalLanguageProgram: string 
**Property** palette: Palette 
**Property** passes: boolean 
**Property** program: string 
**Property** requiredTags: string[] 
**Property** subscribedFix: string 
**Property** taskTypes: PalType[] 

Non-static:
**Method** _runCheck: `_runCheck(_options: any) => Object` 
**Method** buildMessage: `buildMessage() => string` 
**Method** run: `run(options: any) => ColorLint<CheckData>` 

Static:



## Usage
TODO