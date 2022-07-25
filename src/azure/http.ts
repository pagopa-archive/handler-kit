import * as azure from "@azure/functions";

import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { HttpRequest } from "../http/request";
import { validate } from "../validation";

import { trigger, InvalidTriggerError } from "./trigger";

const isHttpTriggeredFunctionContext = (
  ctx: azure.Context
): ctx is azure.Context & { req: azure.HttpRequest } =>
  pipe(
    trigger(ctx.bindingDefinitions),
    O.filter((t) => t.type === "httpTrigger"),
    O.isSome
  );

export const fromHttpRequest = (ctx: azure.Context) =>
  pipe(
    ctx,
    E.fromPredicate(
      isHttpTriggeredFunctionContext,
      () =>
        new InvalidTriggerError(
          "This function can be trigger only by an HTTP request"
        )
    ),
    E.map((ctx) => ctx.req),
    E.chainW(validate(HttpRequest, "Unable to validate the Azure HTTP request"))
  );
