import * as azure from "@azure/functions";

import * as t from "io-ts";

import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

import { parse } from "fp-ts/Json";

import { validate } from "../validation";
import { trigger, InvalidTriggerError } from "./trigger";

const isQueueTriggeredFunctionContext = (
  ctx: azure.Context
): ctx is azure.Context & {
  bindingData: {
    QueueTrigger: string;
  };
} =>
  pipe(
    trigger(ctx.bindingDefinitions),
    O.filter((t) => t.type === "queueTrigger"),
    O.isSome
  );

export const fromQueueMessage =
  <T>(schema: t.Decoder<unknown, T>) =>
  (ctx: azure.Context) =>
    pipe(
      ctx,
      E.fromPredicate(
        isQueueTriggeredFunctionContext,
        () =>
          new InvalidTriggerError(
            "This function can be triggered only by a Queue Message"
          )
      ),
      E.map((ctx) => ctx.bindingData.queueTrigger),
      E.chain(parse),
      E.chainW(validate(schema, "Unable to validate the Queue Message schema"))
    );
