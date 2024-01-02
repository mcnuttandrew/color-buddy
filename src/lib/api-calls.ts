import { Color } from "./Color";
import type { Palette } from "../stores/color-store";

type Engine = "openai" | "google";

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
      const result = x.choices
        .map((x: any) => x?.message?.content)
        .filter((x: any) => x)
        .flatMap((x: any) => (parseAsJSON ? JSON.parse(x) : x));
      // .filter((x: any) => typeof x === "string");
      return result;
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
      const result = x?.response?.candidates
        .flatMap((x: any) => x.content?.parts?.flatMap((x: any) => x.text))
        .map((x: any) => x.replace(/\\n/g, "").replace(/\`/g, "").trim())
        .flatMap((x: any) => (parseAsJSON ? JSON.parse(x) : x));

      return result;
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
  const body = JSON.stringify({
    colors: palette.colors.map((x) => toHex(x)),
    background: palette.background.toHex(),
  });
  return engineToScaffold[engine]<string>(`suggest-name`, body, true);
}

export function suggestAdditionsToPalette(
  palette: Palette,
  engine: Engine,
  search: string
): Promise<string[]> {
  const body = JSON.stringify({
    colors: palette.colors.map((x) => toHex(x)),
    background: palette.background.toHex(),
    name: palette.name,
    search,
  });

  return engineToScaffold[engine]<string>(`get-color-suggestions`, body, true);
}

export function suggestPal(prompt: string, engine: Engine) {
  const body = JSON.stringify({ prompt });
  return engineToScaffold[engine]<{ colors: string[]; background: string }>(
    `suggest-a-pal`,
    body,
    true
  );
}

export function suggestAdjustments(
  prompt: string,
  currentPal: Palette,
  engine: Engine
) {
  const body = JSON.stringify({ prompt, ...palToString(currentPal) });
  return engineToScaffold[engine]<{ background: string; colors: string[] }>(
    `suggest-adjustments`,
    body,
    true
  );
}

export function suggestContextualAdjustments(
  prompt: string,
  currentPal: Palette,
  engine: Engine
) {
  const body = JSON.stringify({ prompt, ...palToString(currentPal) });
  return engineToScaffold[engine]<{ background: string; colors: string[] }>(
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
