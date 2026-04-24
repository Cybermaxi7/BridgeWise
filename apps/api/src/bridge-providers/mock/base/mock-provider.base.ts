// packages/bridge-providers/mock/base/mock-provider.base.ts
import { MockConfig, MockScenario } from "../scenarios/scenario.types";
import { delay } from "../utils/delay.util";

export abstract class MockProviderBase {
  protected scenario: MockScenario;
  protected delayMs: number;

  constructor(config?: MockConfig) {
    this.scenario = config?.scenario || "success";
    this.delayMs = config?.delayMs ?? 100;
  }

  protected async simulate<T>(
    successResponse: T,
    failureResponse?: any
  ): Promise<T> {
    await delay(this.delayMs);

    switch (this.scenario) {
      case "success":
        return successResponse;

      case "failure":
        throw failureResponse || new Error("Mock failure");

      case "timeout":
        await delay(5000);
        throw new Error("Mock timeout");

      case "random":
        return Math.random() > 0.5
          ? successResponse
          : Promise.reject(failureResponse || new Error("Random failure"));

      default:
        return successResponse;
    }
  }
}