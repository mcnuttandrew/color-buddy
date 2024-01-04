import { Color } from "./Color";
import type { Palette } from "../stores/color-store";

type Engine = "openai" | "google";
type SimplePal = { background: string; colors: string[] };
const palToString = (pal: Palette) => ({
  background: pal.background.toHex(),
  colors: pal.colors.map((x) => x.toHex()),
});

function openAIScaffold<A>(
  api: string,
  body: string,
  parseAsJSON: boolean
): Promise<A[]> {
  return fetch(`/.netlify/functions/${api}?engine=openai`, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body,
  })
    .then((response) => response.json())
    .then((x: any) => {
      console.log(x);
      return x.choices
        .map((x: any) => x?.message?.content)
        .filter((x: any) => x)
        .flatMap((x: any) => (parseAsJSON ? JSON.parse(x) : x));
    });
}

function googleScaffold<A>(
  api: string,
  body: string,
  parseAsJSON: boolean
): Promise<A[]> {
  return fetch(`/.netlify/functions/${api}?engine=google`, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body,
  })
    .then((response) => response.json())
    .then((x: any) => {
      console.log(x);
      return x?.response?.candidates
        .flatMap((x: any) => x.content?.parts?.flatMap((x: any) => x.text))
        .map((x: any) => x.replace(/\\n/g, "").replace(/\`/g, "").trim())
        .flatMap((x: any) => (parseAsJSON ? JSON.parse(x) : x));
    });
}

const toHex = (x: Color) => x.toHex().toUpperCase();

const engineToScaffold = {
  openai: openAIScaffold,
  google: googleScaffold,
};

export function suggestNameForPalette(
  palette: Palette,
  engine: Engine
): Promise<string[]> {
  const body = JSON.stringify({ ...palToString(palette) });
  return engineToScaffold[engine]<string>(`suggest-name`, body, true);
}

export function suggestAdditionsToPalette(
  palette: Palette,
  engine: Engine,
  search: string
): Promise<string[]> {
  const body = JSON.stringify({
    ...palToString(palette),
    name: palette.name,
    search,
  });

  return engineToScaffold[engine]<string>(`get-color-suggestions`, body, true);
}

export function suggestPal(prompt: string, engine: Engine) {
  const body = JSON.stringify({ prompt });
  return engineToScaffold[engine]<SimplePal>(`suggest-a-pal`, body, true);
}

export function suggestAdjustments(
  prompt: string,
  currentPal: Palette,
  engine: Engine
) {
  const body = JSON.stringify({ prompt, ...palToString(currentPal) });
  return engineToScaffold[engine]<SimplePal>(`suggest-adjustments`, body, true);
}

export function suggestContextualAdjustments(
  prompt: string,
  currentPal: Palette,
  engine: Engine
) {
  const body = JSON.stringify({ prompt, ...palToString(currentPal) });
  return engineToScaffold[engine]<SimplePal>(
    `suggest-contextual-adjustments`,
    body,
    true
  );
}

export function suggestSVGImage(prompt: string, engine: Engine) {
  const body = JSON.stringify({ prompt });
  return engineToScaffold[engine]<{ svg: string }>(
    `suggest-svg-img`,
    body,
    false
  );
}

export function suggestFix(currentPal: Palette, error: string, engine: Engine) {
  const body = JSON.stringify({ ...palToString(currentPal), error });
  return engineToScaffold[engine]<SimplePal>(`suggest-fix`, body, true);
}
