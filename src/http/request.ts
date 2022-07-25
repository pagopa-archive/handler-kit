import * as t from "io-ts";

import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";

import { lookup } from "fp-ts/Record";
import { ValidationError } from "../validation";

const HttpMethod = t.keyof({
  GET: null,
  POST: null,
  PUT: null,
  PATCH: null,
  DELETE: null,
});

export const HttpRequest = t.type({
  url: t.string,
  method: HttpMethod,
  params: t.record(t.string, t.string),
  query: t.record(t.string, t.string),
  headers: t.record(t.string, t.string),
  body: t.unknown,
});

export type HttpRequest = t.TypeOf<typeof HttpRequest>;

type ParameterType = keyof Pick<HttpRequest, "query" | "headers" | "params">;

const param = (type: ParameterType) => (name: string) => (req: HttpRequest) =>
  lookup(name)(req[type]);

export const query = param("query");
export const header = param("headers");
export const path = param("params");

export const body =
  <T>({ decode }: t.Decoder<unknown, T>) =>
  (req: HttpRequest) =>
    pipe(
      decode(req.body),
      E.mapLeft(
        (e) => new ValidationError(e, "Unable to validate the request body")
      )
    );
