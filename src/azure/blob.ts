import * as azure from "@azure/functions";

import * as t from "io-ts";

import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

import { sequenceS } from "fp-ts/lib/Apply";
import { validate } from "../validation";
import { trigger, InvalidTriggerError } from "./trigger";

const isBlobTriggeredFunctionContext = (
  ctx: azure.Context
): ctx is azure.Context & {
  bindingData: {
    uri: string;
    metadata: unknown;
  };
} =>
  pipe(
    trigger(ctx.bindingDefinitions),
    O.filter((t) => t.type === "blobTrigger"),
    O.isSome
  );

export type Blob<T> = {
  uri: string;
  metadata: T;
};

export const fromBlobStorage =
  <T>(metadataSchema: t.Decoder<unknown, T>) =>
  (ctx: azure.Context): E.Either<Error, Blob<T>> =>
    pipe(
      ctx,
      E.fromPredicate(
        isBlobTriggeredFunctionContext,
        () =>
          new InvalidTriggerError(
            "This function can be triggerd only by Blob Storage"
          )
      ),
      E.chainW((ctx) =>
        sequenceS(E.Apply)({
          metadata: validate(
            metadataSchema,
            "Unable to validate the metadata schema"
          )(ctx.bindingData.metadata),
          uri: E.right(ctx.bindingData.uri),
        })
      )
    );
