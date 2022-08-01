import {
  ReaderTaskEither,
  chainTaskEitherK,
  fold,
  right,
} from "fp-ts/ReaderTaskEither";

import { TaskEither } from "fp-ts/TaskEither";

import * as RT from "fp-ts/ReaderTask";
import { pipe, flow } from "fp-ts/function";

import { HttpResponse } from "./http";

export type RequestDecoder<R, D> = ReaderTaskEither<R, Error, D>;

export const nopRequestDecoder = right(void 0);

export type Service<P, A> = (payload: P) => TaskEither<Error, A>;

export type Output = HttpResponse | Error | void;

export type Handler<R> = RT.ReaderTask<R, Output>;

export const createHandler = <R, P, A>(
  requestDecoder: RequestDecoder<R, P>,
  service: Service<P, A>,
  onError: (e: Error) => Output,
  onSuccess: (a: A) => Output
): Handler<R> =>
  pipe(
    requestDecoder,
    chainTaskEitherK(service),
    fold<R, Error, A, Output>(flow(onError, RT.of), flow(onSuccess, RT.of))
  );
