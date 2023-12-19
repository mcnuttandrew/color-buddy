import { Color } from "./Color";
import type { Palette } from "../stores/color-store";

type Engine = "openai" | "google";

const palToString = (pal: Palette) => ({
  background: pal.background.toHex(),
  colors: pal.colors.map((x) => x.toHex()),
});

function openAIScaffold<A>(api: string, body: string): Promise<A[]> {
  return fetch(`${api}?engine=openai`, {
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
        .flatMap((x: any) => JSON.parse(x));
      // .filter((x: any) => typeof x === "string");
      return result;
    });
}

function googleScaffold<A>(api: string, body: string): Promise<A[]> {
  return fetch(`${api}?engine=google`, {
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
        .flatMap((x: any) => JSON.parse(x));

      return result;
    });
}

const toHex = (x: Color) => x.toHex().toUpperCase();

const engineToScaffold = {
  openai: openAIScaffold,
  google: googleScaffold,
};

export function suggestNameForPalette(
  palette: Color[],
  background: Color,
  engine: Engine
): Promise<string[]> {
  const body = JSON.stringify({
    colors: palette.map((x) => toHex(x)),
    background: background.toHex(),
  });
  const scaffold = engineToScaffold[engine];
  return scaffold<string>(`/.netlify/functions/suggest-name`, body);
}

export function suggestAdditionsToPalette(
  palette: Color[],
  background: Color,
  engine: Engine
): Promise<string[]> {
  const body = JSON.stringify({
    colors: palette.map((x) => toHex(x)),
    background: background.toHex(),
  });

  const scaffold = engineToScaffold[engine];
  return scaffold<string>(`/.netlify/functions/get-color-suggestions`, body);
}

export function suggestPal(prompt: string, engine: Engine) {
  const body = JSON.stringify({ prompt });
  const scaffold = engineToScaffold[engine];
  return scaffold<{ colors: string[]; background: string }>(
    `/.netlify/functions/suggest-a-pal`,
    body
  );
}

export function suggestAdjustments(
  prompt: string,
  currentPal: Palette,
  engine: Engine
) {
  const body = JSON.stringify({ prompt, ...palToString(currentPal) });
  const scaffold = engineToScaffold[engine];
  return scaffold<string>(`/.netlify/functions/suggest-adjustments`, body);
}
