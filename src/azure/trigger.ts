import * as azure from "@azure/functions";

import { findFirst } from "fp-ts/Array";

import { ProblemDetail } from "../problem-detail";

export type AzureFunctionTrigger = {
  type: "queueTrigger" | "httpTrigger" | "blobTrigger";
  direction: "in";
  name: string;
};

export const trigger = findFirst(
  (b: azure.BindingDefinition): b is AzureFunctionTrigger =>
    ["queueTrigger", "httpTrigger", "blobTrigger"].includes(b.type)
);

export class InvalidTriggerError extends Error implements ProblemDetail {
  type = "/probs/invalid-azure-function-trigger";
  title = "Invalid Azure Function trigger";
  status = "500";
  constructor(public detail: string) {
    super(detail);
    this.name = "InvalidTriggerError";
  }
}
