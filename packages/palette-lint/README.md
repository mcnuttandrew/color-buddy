# Palette Lint

Have you ever looked closely at a color palette and wondered if it was a good palette or just the one you had? Palette Lint is a tool that helps you evaluate the quality of a color palette. It operates analogously to a spell checker (or more closely, like a linter), but for color palettes. It will help you identify issues with your palette and suggest improvements.

Example usage todo! For now see the test files for examples.

## Contents

This library contains the following functions:

### generateMCFix

**Function**: `generateMCFix(palette: Palette, lints: LintProgram[]) => Palette`

### linter

**Function**: `linter(palette: Palette, lints: LintProgram[], options: RunLintOptions) => LintResult[]`

### simulateCVD

**Function**: `simulateCVD(deficiency: string, color: Color) => Color`

### suggestLintFix

**Function**: `suggestLintFix(palette: Palette, lint: LintResult, _engine: string) => Promise<Palette[]>`

This library contains the following types:

### LintResult

**Type**: `LintResult: SuccessLintResult | IgnoredLintResult | InvalidLintResult`

## Usage

TODO
