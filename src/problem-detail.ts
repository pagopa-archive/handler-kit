// note: we can't use io-ts here, because it doesn't work well
// with custom Error classes

// TODO: open an issue to gcanti/io-ts regarding this problem

export interface ProblemDetail {
  type: string;
  title: string;
  detail: string;
  status: string;
}

export const isProblemDetail = (u: unknown): u is ProblemDetail => {
  const problem = u as ProblemDetail;
  return (
    "type" in problem &&
    problem.type.length > 0 &&
    "status" in problem &&
    problem.status.length > 0 &&
    "title" in problem &&
    problem.title.length > 0
  );
};
