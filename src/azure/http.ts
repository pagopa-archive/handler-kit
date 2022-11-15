import * as azure from "@azure/functions";

import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { pipe, flow } from "fp-ts/function";

import { HttpRequest } from "../http/request";

import { InvalidTriggerError, trigger } from "./trigger";

const isHttpTriggeredFunctionContext = (
  ctx: azure.Context
): ctx is azure.Context & { req: azure.HttpRequest } =>
  pipe(
    trigger(ctx.bindingDefinitions),
    O.filter((t) => t.type === "httpTrigger"),
    O.isSome
  );

export class HttpRequestParseError extends Error {
  name = "HttpRequestParseError";
  req?: azure.HttpRequest;
  constructor(req?: azure.HttpRequest) {
    super("Unable to validate the HTTP request from Azure.");
    this.req = req;
  }
}

export const fromHttpRequest = (ctx: azure.Context) =>
  pipe(
    ctx,
    E.fromPredicate(
      isHttpTriggeredFunctionContext,
      () =>
        new InvalidTriggerError(
          "This function can be triggered only by an HTTP request."
        )
    ),
    E.map((ctx) => ctx.req),
    E.chainW(
      flow(
        HttpRequest.decode,
        E.mapLeft(() => new HttpRequestParseError(ctx.req))
      )
    )
  );
