import type { Palette } from "../types";
import * as Json from "jsonc-parser";
import LintWorker from "./linter-tools/lint-worker.worker?worker";
import { summarizePal } from "./utils";

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
        .flatMap((x: any) => (parseAsJSON ? Json.parse(x) : x));
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
        .map((x: any) =>
          x.replace(/\\n/g, "").replace(/\`/g, "").replace("json", "").trim()
        )
        .flatMap((x: any) => (parseAsJSON ? Json.parse(x) : x));
      return result;
    });
}

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

// supports the add color search function
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

export function suggestContextualAdjustments(
  prompt: string,
  currentPal: Palette,
  engine: Engine
) {
  const adjustPrompt = `${summarizePal(currentPal)}\n\n${prompt}`;
  const body = JSON.stringify({
    prompt: adjustPrompt,
    ...palToString(currentPal),
  });
  return engineToScaffold[engine]<SimplePal>(
    `suggest-contextual-adjustments`,
    body,
    true
  );
}

export function suggestFix(currentPal: Palette, msg: string, engine: Engine) {
  const error = `${summarizePal(currentPal)}\n\n${msg}`;
  const body = JSON.stringify({ ...palToString(currentPal), error });
  return engineToScaffold[engine]<SimplePal>(`suggest-fix`, body, true);
}

export function suggestLint(lintPrompt: string, engine: Engine) {
  const body = JSON.stringify({ lintPrompt });
  return engineToScaffold[engine]<string>(`suggest-lint`, body, true);
}

export function suggestLintMetadata(lintProgram: string, engine: Engine) {
  const body = JSON.stringify({ lintProgram });
  return engineToScaffold[engine]<{
    description: string;
    failMessage: string;
    name: string;
  }>(`suggest-lint-metadata`, body, true);
}

// instantiate the worker
const ViteWorker = new LintWorker();

// send and receive messages from the worker
type Message = { type: string; content: string; id?: string };
const randID = () => Math.random().toString(36).substring(7);
function workerDispatch() {
  const waitingCallbacks: { [key: string]: (msg: string) => void } = {};
  ViteWorker.addEventListener("message", (msg: MessageEvent<Message>) => {
    const { id, content } = msg.data;
    if (id && waitingCallbacks[id]) {
      waitingCallbacks[id](content);
      delete waitingCallbacks[id];
    }
  });

  return async function caller(msg: Message) {
    const id = randID();
    ViteWorker.postMessage({ ...msg, id });
    return new Promise<string>((resolve) => {
      waitingCallbacks[id] = resolve;
    });
  };
}
const dispatch = workerDispatch();

export function lint(pal: Palette) {
  // this may be too deep a copy?
  return dispatch({
    type: "run-lint",
    content: JSON.stringify({
      ...pal,
      background: pal.background.toString(),
      colors: pal.colors.map((x) => x.toString()),
    }),
  }).then((x) => {
    return x as unknown as any[];
  });
}

export function loadLints() {
  return dispatch({ type: "load-lints", content: "" });
}
