import * as monaco from "monaco-editor";
import chroma from "chroma-js";

// Import the workers in a production-safe way.
// This is different than in Monaco's documentation for Vite,
// but avoids a weird error ("Unexpected usage") at runtime
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
// todo XML
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
self.MonacoEnvironment = {
  getWorker: function (_: string, label: string) {
    switch (label) {
      case "json":
        return new jsonWorker();
      case "svg":
        return new htmlWorker();
      default:
        return new editorWorker();
    }
  },
};

monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
  validate: true,
  enableSchemaRequest: true,
});

const webColors = [
  "INDIANRED",
  "LIGHTCORAL",
  "SALMON",
  "DARKSALMON",
  "LIGHTSALMON",
  "CRIMSON",
  "RED",
  "DARKRED",
  "PINK",
  "LIGHTPINK",
  "HOTPINK",
  "DEEPPINK",
  "MEDIUMVIOLETRED",
  "PALEVIOLETRED",
  "CORAL",
  "TOMATO",
  "ORANGERED",
  "DARKORANGE",
  "ORANGE",
  "GOLD",
  "YELLOW",
  "LIGHTYELLOW",
  "LEMONCHIFFON",
  "LIGHTGOLDENRODYELLOW",
  "PAPAYAWHIP",
  "MOCCASIN",
  "PEACHPUFF",
  "PALEGOLDENROD",
  "KHAKI",
  "DARKKHAKI",
  "LAVENDER",
  "THISTLE",
  "PLUM",
  "VIOLET",
  "ORCHID",
  "FUCHSIA",
  "MAGENTA",
  "MEDIUMORCHID",
  "MEDIUMPURPLE",
  "REBECCAPURPLE",
  "BLUEVIOLET",
  "DARKVIOLET",
  "DARKORCHID",
  "DARKMAGENTA",
  "PURPLE",
  "INDIGO",
  "SLATEBLUE",
  "DARKSLATEBLUE",
  "MEDIUMSLATEBLUE",
  "GREENYELLOW",
  "CHARTREUSE",
  "LAWNGREEN",
  "LIME",
  "LIMEGREEN",
  "PALEGREEN",
  "LIGHTGREEN",
  "MEDIUMSPRINGGREEN",
  "SPRINGGREEN",
  "MEDIUMSEAGREEN",
  "SEAGREEN",
  "FORESTGREEN",
  "GREEN",
  "DARKGREEN",
  "YELLOWGREEN",
  "OLIVEDRAB",
  "OLIVE",
  "DARKOLIVEGREEN",
  "MEDIUMAQUAMARINE",
  "DARKSEAGREEN",
  "LIGHTSEAGREEN",
  "DARKCYAN",
  "TEAL",
  "AQUA",
  "CYAN",
  "LIGHTCYAN",
  "PALETURQUOISE",
  "AQUAMARINE",
  "TURQUOISE",
  "MEDIUMTURQUOISE",
  "DARKTURQUOISE",
  "CADETBLUE",
  "STEELBLUE",
  "LIGHTSTEELBLUE",
  "POWDERBLUE",
  "LIGHTBLUE",
  "SKYBLUE",
  "LIGHTSKYBLUE",
  "DEEPSKYBLUE",
  "DODGERBLUE",
  "CORNFLOWERBLUE",
  "ROYALBLUE",
  "BLUE",
  "MEDIUMBLUE",
  "DARKBLUE",
  "NAVY",
  "MIDNIGHTBLUE",
  "CORNSILK",
  "BLANCHEDALMOND",
  "BISQUE",
  "NAVAJOWHITE",
  "WHEAT",
  "BURLYWOOD",
  "TAN",
  "ROSYBROWN",
  "SANDYBROWN",
  "GOLDENROD",
  "DARKGOLDENROD",
  "PERU",
  "CHOCOLATE",
  "SADDLEBROWN",
  "SIENNA",
  "BROWN",
  "MAROON",
  "WHITE",
  "SNOW",
  "HONEYDEW",
  "MINTCREAM",
  "AZURE",
  "ALICEBLUE",
  "GHOSTWHITE",
  "WHITESMOKE",
  "SEASHELL",
  "BEIGE",
  "OLDLACE",
  "FLORALWHITE",
  "IVORY",
  "ANTIQUEWHITE",
  "LINEN",
  "LAVENDERBLUSH",
  "MISTYROSE",
  "GAINSBORO",
  "LIGHTGRAY",
  "SILVER",
  "DARKGRAY",
  "GRAY",
  "DIMGRAY",
  "LIGHTSLATEGRAY",
  "SLATEGRAY",
  "DARKSLATEGRAY",
  "BLACK",
].map((x) => `"${x}"`.toLowerCase());

function isHexColor(text: string) {
  return /^#([0-9a-f]{3}){1,2}$/i.test(text);
}

monaco.languages.registerColorProvider("json", {
  provideColorPresentations: (model, colorInfo) => {
    const { red, green, blue } = colorInfo.color;
    const label = chroma.rgb(red * 255, green * 255, blue * 255).hex();
    console.log(label);
    return [{ label: `${label}` }];
  },

  provideDocumentColors: (x: any) => {
    const text = x.getValue();
    const colors: any[] = [];
    for (let i = 0; i < text.length; i++) {
      const is7LenHex = isHexColor(text.slice(i, i + 7));
      if (text[i] === "#" && (is7LenHex || isHexColor(text.slice(i, i + 4)))) {
        console.log("here", is7LenHex);
        const len = is7LenHex ? 7 : 4;
        const color = chroma(text.slice(i, i + len)).rgb();
        colors.push({
          color: {
            red: color[0] / 255,
            green: color[1] / 255,
            blue: color[2] / 255,
          },
          range: {
            startLineNumber: x.getPositionAt(i).lineNumber,
            startColumn: x.getPositionAt(i).column,
            endLineNumber: x.getPositionAt(i + len).lineNumber,
            endColumn: x.getPositionAt(i + len).column,
          },
        });
      } else {
        // web colors
        for (let j = 0; j < webColors.length; j++) {
          const color = webColors[j];
          const start = i;
          const end = i + color.length;
          const word = text.slice(start, end);
          if (word.toLowerCase() === color) {
            const webColor = chroma(color.replace(/\"/g, "")).rgb();
            colors.push({
              color: {
                red: webColor[0] / 255,
                green: webColor[1] / 255,
                blue: webColor[2] / 255,
              },
              range: {
                startLineNumber: x.getPositionAt(start).lineNumber,
                startColumn: x.getPositionAt(start).column,
                endLineNumber: x.getPositionAt(end).lineNumber,
                endColumn: x.getPositionAt(end).column,
              },
            });
          }
        }
      }
    }

    return colors;
  },
});

export default monaco;
