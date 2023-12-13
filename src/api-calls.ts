export function suggestNameForPalette(palette: string[]): Promise<string[]> {
  const body = JSON.stringify(palette);
  return (
    fetch(`/.netlify/functions/suggest-name`, {
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
      // open ai version
      // .then((x: any) => {
      //   const result = x.choices
      //     .map((x: any) => x?.message?.content)
      //     .filter((x: any) => x)
      //     .flatMap((x: any) => JSON.parse(x))
      //     .filter((x) => typeof x === "string");
      //   return result;
      // });
      // google version
      .then((x: any) => {
        const result = x?.response?.candidates
          .flatMap((x: any) => x.content?.parts?.flatMap((x: any) => x.text))
          .map((x: any) => x.replace(/\\n/g, "").replace(/\`/g, "").trim())
          .flatMap((x: any) => JSON.parse(x));

        return result;
      })
  );
}

export function suggestAdditionsToPalette(
  palette: string[]
): Promise<string[]> {
  const body = JSON.stringify(palette);
  return (
    fetch(`/.netlify/functions/get-color-suggestions`, {
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
      // open ai version
      // .then((x: any) => {
      //   const result = x.choices
      //     .map((x: any) => x?.message?.content)
      //     .filter((x: any) => x)
      //     .flatMap((x: any) => JSON.parse(x))
      //     .filter((x) => typeof x === "string");
      //   return result;
      // });
      // google version
      .then((x: any) => {
        console.log(x);
        const result = x?.response?.candidates
          .flatMap((x: any) => x.content?.parts?.flatMap((x: any) => x.text))
          .map((x: any) => x.replace(/\\n/g, "").replace(/\`/g, "").trim())
          .flatMap((x: any) => JSON.parse(x));

        return result;
      })
  );
}
