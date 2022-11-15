import { AzureFunction, Context } from "@azure/functions";

import { Handler } from "..";

import * as http from "../http";

export * from "./http";
export * from "./queue";
export * from "./blob";

export const unsafeRun =
  <T>(handler: Handler<Context, T>): AzureFunction =>
  async (ctx) => {
    const output = await handler(ctx)();
    if (http.isResponse(output)) {
      return {
        body: output.body,
        statusCode: output.statusCode,
        headers: output.headers,
      };
    } else if (output instanceof Error) {
      throw output;
    }
  };
