import * as azure from "@azure/functions";

import * as t from "io-ts";

import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

import { sequenceS } from "fp-ts/lib/Apply";
import { InvalidTriggerError, trigger } from "./trigger";

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

export class BlobMetadataParseError extends Error {
  name = "BlobMetadataParseError";
  metadata: unknown;
  constructor(metadata: unknown) {
    super("Unable to parse the Blob Metadata");
    this.metadata = metadata;
  }
}

export const fromBlobStorage =
  <T>(metadataSchema: t.Decoder<unknown, T>) =>
  (ctx: azure.Context) =>
    pipe(
      ctx,
      E.fromPredicate(
        isBlobTriggeredFunctionContext,
        () =>
          new InvalidTriggerError(
            "This function can be triggered only by Blob Storage"
          )
      ),
      E.chainW((ctx) =>
        sequenceS(E.Apply)({
          metadata: pipe(
            metadataSchema.decode(ctx.bindingData.metadata),
            E.mapLeft(
              () => new BlobMetadataParseError(ctx.bindingData.metadata)
            )
          ),
          uri: E.right(ctx.bindingData.uri),
        })
      )
    );
