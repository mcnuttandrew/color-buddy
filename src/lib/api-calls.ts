import { Color } from "./Color";

function openAIScaffold<A>(api: string, body: string): Promise<A[]> {
  return fetch(api, {
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

function googleScaffold(api: string, body: string): Promise<string[]> {
  return fetch(api, {
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

export function suggestNameForPalette(
  palette: Color[],
  background: Color
): Promise<string[]> {
  const body = JSON.stringify({
    palette: palette.map((x) => toHex(x)),
    background: background.toHex(),
  });
  return openAIScaffold<string>(`/.netlify/functions/suggest-name`, body);
  // return googleScaffold(`/.netlify/functions/suggest-name`, body);
}

export function suggestAdditionsToPalette(
  palette: Color[],
  background: Color
): Promise<string[]> {
  const body = JSON.stringify({
    palette: palette.map((x) => toHex(x)),
    background: background.toHex(),
  });
  return openAIScaffold<string>(
    `/.netlify/functions/get-color-suggestions`,
    body
  );
  // return googleScaffold(`/.netlify/functions/get-color-suggestions`, body);
}

export function suggestPal(prompt: string) {
  const body = JSON.stringify({
    prompt,
  });
  return openAIScaffold<{ colors: string[]; background: string }>(
    `/.netlify/functions/suggest-a-pal`,
    body
  );
  // return googleScaffold(`/.netlify/functions/suggest-a-pal`, body);
}
