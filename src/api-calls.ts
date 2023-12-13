export function suggestNameForPalette(palette: string[]): Promise<string[]> {
  const body = JSON.stringify(palette);
  return fetch(`/.netlify/functions/suggest-name`, {
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
      const result = x.choices
        .map((x: any) => x?.message?.content)
        .filter((x: any) => x)
        .flatMap((x: any) => JSON.parse(x))
        .filter((x) => typeof x === "string");
      return result;
    });
}
