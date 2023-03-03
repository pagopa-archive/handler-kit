import * as azure from "@azure/functions";

import * as t from "io-ts";

import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

import { InvalidTriggerError, trigger } from "./trigger";

const isEventHubTriggeredFunctionContext = (
  ctx: azure.Context
): ctx is azure.Context =>
  pipe(
    trigger(ctx.bindingDefinitions),
    O.filter((t) => t.type === "eventHubTrigger"),
    O.isSome
  );

export class EventHubMessageParseError extends Error {
  name = "EventHubMessageParseError";
  eventHubMessage: unknown;
  constructor(eventHubMessage: unknown) {
    super("Unable to parse the Event Hub Message");
    this.eventHubMessage = eventHubMessage;
  }
}
/* eventName is the name of the variable that represents the event item in function code.
 * Is equivalent to the name in function.json
 */
export const fromEventHubMessage =
  <T>(schema: t.Decoder<unknown, T>, eventName: string) =>
  (ctx: azure.Context) =>
    pipe(
      ctx,
      E.fromPredicate(
        isEventHubTriggeredFunctionContext,
        () =>
          new InvalidTriggerError(
            "This function can be triggered only by an Event Hub Message"
          )
      ),
      E.map((ctx) => ctx.bindings[eventName]),
      E.chainW((message) =>
        pipe(
          schema.decode(message),
          E.mapLeft(() => new EventHubMessageParseError(message))
        )
      )
    );
