import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";

import { stringify } from "fp-ts/lib/Json";
import { upsertAt } from "fp-ts/Record";
import { flow } from "fp-ts/function";

import * as t from "io-ts";
import { isProblemDetail, ProblemDetail } from "../problem-detail";

class SerializationError extends Error implements ProblemDetail {
  type = "/probs/serialization-error";
  title = "Response serialization error";
  status = "500";
  constructor(
    public readonly detail: string = "Unable to serialize the response."
  ) {
    super(detail);
    this.name = "SerializationError";
  }
}

const serialize = <T>(schema: t.Decoder<unknown, T>) =>
  flow(
    schema.decode,
    E.chain(stringify),
    E.mapLeft(() => new SerializationError())
  );

export const HttpResponse = t.type({
  body: t.string,
  statusCode: t.string,
  headers: t.record(t.string, t.string),
});

export type HttpResponse = t.TypeOf<typeof HttpResponse>;

export const withStatus = (statusCode: string) => (res: HttpResponse) => ({
  ...res,
  statusCode,
});

export const withHeader =
  (name: string, value: string) => (res: HttpResponse) => ({
    ...res,
    headers: upsertAt(name, value)(res.headers),
  });

export const response =
  (transform: (res: HttpResponse) => HttpResponse) =>
  <T>(schema: t.Decoder<unknown, T>) =>
    flow(
      serialize(schema),
      E.map(
        (body: string): HttpResponse => ({
          body,
          statusCode: "200",
          headers: {
            "Content-Type": "application/json",
          },
        })
      ),
      E.map(transform),
      E.getOrElse((e) => error(e))
    );

export const success = response(withStatus("200"));
export const created = response(withStatus("201"));

/**
 * Converts an Error instance into a Problem Detail (RRFC 7807)
 * JSON response. In order to protect sensitive information,
 * the function returns a "SerializationError" if the error object lacks
 * the necessary properties from the "Problem Detail" format.
 */
export const error = flow(
  O.fromPredicate(isProblemDetail),
  O.getOrElse((): ProblemDetail => new SerializationError()),
  (problem): HttpResponse => ({
    statusCode: problem.status,
    body: JSON.stringify(problem),
    headers: {
      "Content-Type": "application/problem+json",
    },
  })
);
