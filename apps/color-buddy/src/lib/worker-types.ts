export type WorkerCommand =
  | { type: "load-lints"; content: string; id: string }
  | { type: "run-lint"; content: string; id: string }
  | { type: "run-lint-no-message"; content: string; id: string }
  | { type: "monte-carlo-fix"; content: string; id: string };
