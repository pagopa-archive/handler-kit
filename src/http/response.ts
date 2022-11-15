import { pipe } from "fp-ts/lib/function";
import { stringify } from "fp-ts/lib/Json";
import * as E from "fp-ts/lib/Either";

export type Response<T> = {
  body: T;
  statusCode: number;
  headers: Record<string, string>;
};

export const isResponse = (u: unknown): u is Response<unknown> => {
  const resp = u as Response<unknown>;
  return (
    typeof resp.statusCode == "number" &&
    Number.isInteger(resp.statusCode) &&
    typeof resp.headers === "object" &&
    resp.headers !== null &&
    typeof resp.body !== "undefined" &&
    resp.body !== null
  );
};

export const response = <T>(body: T): Response<T> => ({
  body,
  statusCode: 200,
  headers: {},
});

export const empty: Response<undefined> = {
  body: void 0,
  statusCode: 204,
  headers: {},
};

export const withBody =
  <B>(body: B) =>
  <T>(response: Response<T>): Response<B> => ({
    ...response,
    body,
  });

export const withStatusCode =
  (statusCode: number) =>
  <T>(response: Response<T>): Response<T> => ({
    ...response,
    statusCode,
  });

export const withHeader =
  (name: string, value: string) =>
  <T>(response: Response<T>): Response<T> => ({
    ...response,
    headers: {
      ...response.headers,
      [name]: value,
    },
  });

export class SerializationError extends Error {
  name = "SerializationError";
}

export const serializeToJSON = <T>(res: Response<T>) =>
  pipe(
    stringify(res.body),
    E.mapLeft(
      () =>
        new SerializationError("Unable to serialize the HTTP response in JSON.")
    ),
    E.map((json) => pipe(res, withBody(json))),
    E.map(withHeader("Content-Type", "application/json"))
  );
