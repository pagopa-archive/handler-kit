import * as t from "io-ts";
import { failure } from "io-ts/PathReporter";

import * as E from "fp-ts/Either";
import { flow } from "fp-ts/function";
import { ProblemDetail } from "./problem-detail";

export class ValidationError extends Error implements ProblemDetail {
  type = "/probs/validation-error" as const;
  title = "Your request parameters didn't validate.";
  status = "400";
  violations: string[];
  constructor(violations: t.Errors, public detail: string) {
    super(detail);
    this.violations = failure(violations);
  }
}

export const validate = <T>(schema: t.Decoder<unknown, T>, detail: string) =>
  flow(
    schema.decode,
    E.mapLeft((e) => new ValidationError(e, detail))
  );
