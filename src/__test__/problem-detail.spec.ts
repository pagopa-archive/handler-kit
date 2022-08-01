import { isProblemDetail, ProblemDetail } from "../problem-detail";

class MyCustomError extends Error implements ProblemDetail {
  type = "/problems/my-custom-error";
  title = "My custom error";
  status = "418";
  constructor(public detail: string) {
    super(detail);
    this.name = "MyCustomError";
  }
}

describe("ProblemDetail", () => {
  describe("Given a custom error that implements ProblemDetail", () => {
    let custom: MyCustomError;
    beforeAll(() => {
      custom = new MyCustomError("I'm a teapot.");
    });
    it("should pass the ProblemDetail type guard check", () => {
      expect(isProblemDetail(custom)).toBe(true);
    });
  });
});
