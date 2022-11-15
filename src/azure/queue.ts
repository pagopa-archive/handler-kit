import * as azure from "@azure/functions";

import * as t from "io-ts";

import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

import { InvalidTriggerError, trigger } from "./trigger";

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

export class QueueMessageParseError extends Error {
  name = "QueueMessageParseError";
  queueMessage: unknown;
  constructor(queueMessage: unknown) {
    super("Unable to parse the Queue Message");
    this.queueMessage = queueMessage;
  }
}

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
      E.chainW((message) =>
        pipe(
          schema.decode(message),
          E.mapLeft(() => new QueueMessageParseError(message))
        )
      )
    );
