type Command = { type: "load-data"; content: "" };

async function dispatch(cmd: Command) {
  switch (cmd.type) {
    case "load-data":
      await loadData();
      break;
  }
}

self.onmessage = (event: MessageEvent<string>) => {
  let response = "";
  console.log("here", event.data);
  self.postMessage(event.data);
};

export {}; // this is to make typescript happy
