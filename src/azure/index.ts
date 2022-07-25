import { AzureFunction, Context } from "@azure/functions";

import { Handler } from "..";
import { HttpResponse } from "../http";

export * from "./http";
export * from "./queue";
export * from "./blob";

export const unsafeRun =
  (handler: Handler<Context>): AzureFunction =>
  async (ctx) => {
    const output = await handler(ctx)();
    if (HttpResponse.is(output)) {
      return {
        body: output.body,
        statusCode: output.statusCode,
        headers: output.headers,
      };
    } else if (output instanceof Error) {
      throw output;
    }
  };
