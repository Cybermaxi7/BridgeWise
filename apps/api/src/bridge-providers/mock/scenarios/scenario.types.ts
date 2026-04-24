// packages/bridge-providers/mock/scenarios/scenario.types.ts
export type MockScenario =
  | "success"
  | "failure"
  | "timeout"
  | "random";

export interface MockConfig {
  scenario?: MockScenario;
  delayMs?: number;
}