import * as azure from "@azure/functions";

import { findFirst } from "fp-ts/Array";

export type AzureFunctionTrigger = {
  type: "queueTrigger" | "httpTrigger" | "blobTrigger";
  direction: "in";
  name: string;
};

export const trigger = findFirst(
  (b: azure.BindingDefinition): b is AzureFunctionTrigger =>
    ["queueTrigger", "httpTrigger", "blobTrigger"].includes(b.type)
);

export class InvalidTriggerError extends Error {
  name = "InvalidTriggerError";
}
