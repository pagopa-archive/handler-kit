import { describe, it, expect } from "vitest";
import * as O from "fp-ts/lib/Option";
import { HttpRequest, query, path, header } from "../request";

describe.concurrent("request", () => {
  describe("param", () => {
    it("should find a param", () => {
      const req: HttpRequest = {
        url: "https://my.example.site/",
        method: "GET",
        query: {
          q: "hello, world",
        },
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          myResourceId: "59",
        },
        body: "it works",
      };
      expect(query("q")(req)).toStrictEqual(O.some("hello, world"));
      expect(query("not-present")(req)).toStrictEqual(O.none);
      expect(path("myResourceId")(req)).toStrictEqual(O.some("59"));
      expect(header("Content-Type")(req)).toStrictEqual(
        O.some("application/json")
      );
    });
  });
});
