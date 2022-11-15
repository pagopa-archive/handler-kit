import { describe, it, expect } from "vitest";

import { identity, pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";
import {
  empty,
  isResponse,
  response,
  SerializationError,
  serializeToJSON,
  withBody,
  withHeader,
  withStatusCode,
} from "../response";

describe.concurrent("response", () => {
  describe.concurrent("isResponse", () => {
    it("should pass on well-formed response", () => {
      const res = response("well-formed!!");
      expect(isResponse(res)).toBe(true);
    });
    it("should not pass on invalid response", () => {
      const invalid = [
        {},
        {
          body: {
            message: "hello!",
          },
          statusCode: 204,
        },
        {
          statusCode: 204,
          headers: {},
        },
        {
          body: "hello",
          statusCode: 404.3,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ];
      const result = invalid.map(isResponse).every((check) => !check);
      expect(result).toBe(true);
    });
  });
  describe("empty", () => {
    it("should be an empty (204) response", () => {
      expect(empty.statusCode).toBe(204);
      expect(empty.body).toBeUndefined();
    });
  });
  describe("response", () => {
    it("should create a success (200) response", () => {
      const res = response("test");
      expect(res.body).toBe("test");
      expect(res.statusCode).toBe(200);
    });
  });
  describe("withBody", () => {
    it("should replace the response body", () => {
      const res = response("test");
      const updated = pipe(res, withBody("passed"));
      expect(updated.body).toBe("passed");
    });
  });
  describe("withStatusCode", () => {
    it("should replace the response status code", () => {
      const res = response("test");
      const updated = pipe(res, withStatusCode(401));
      expect(updated.statusCode).toBe(401);
    });
  });
  describe("withHeader", () => {
    it("should append new response header", () => {
      const res = pipe(response("test"), withHeader("x-test", "it works"));
      expect(res.headers).toHaveProperty("x-test", "it works");
    });
    it("should replace headers that are already set", () => {
      const res = pipe(response("test"), withHeader("x-test", "initial state"));
      const updated = pipe(res, withHeader("x-test", "updated"));
      expect(updated.headers).toHaveProperty("x-test", "updated");
    });
  });
  describe("serializeToJSON", () => {
    it("should transform a valid response in a JSON serialized one", () => {
      const payload = {
        message: "it works!",
      };
      const res = pipe(
        response(payload),
        serializeToJSON,
        E.getOrElseW(identity)
      );
      expect(isResponse(res)).toBe(true);
      expect(res).not.toBeInstanceOf(SerializationError);
      if (isResponse(res)) {
        expect(res.body).toBeTypeOf("string");
        expect(res.body).toBe(JSON.stringify(payload));
        expect(res.headers).toHaveProperty("Content-Type", "application/json");
      }
    });
    it("should return a Serialized Error when the serialization fails", () => {
      const res = pipe(
        response(() => "functions can't be serialized"),
        serializeToJSON,
        E.getOrElseW(identity)
      );
      expect(res).toBeInstanceOf(SerializationError);
    });
  });
});
