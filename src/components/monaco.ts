import * as monaco from "monaco-editor";

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

export default monaco;
