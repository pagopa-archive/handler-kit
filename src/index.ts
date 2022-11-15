import {
  ReaderTaskEither,
  chainTaskEitherK,
  fold,
  right,
} from "fp-ts/ReaderTaskEither";

import { TaskEither } from "fp-ts/TaskEither";

import * as RT from "fp-ts/ReaderTask";
import { pipe, flow } from "fp-ts/function";

import type * as http from "./http";

export type RequestDecoder<R, D> = ReaderTaskEither<R, Error, D>;

export const nopRequestDecoder = right(void 0);

export type Service<P, A> = (payload: P) => TaskEither<Error, A>;

export type Output<T> = http.Response<T> | Error | void;

export type Handler<R, T> = RT.ReaderTask<R, Output<T>>;

export const createHandler = <R, P, A, T>(
  requestDecoder: RequestDecoder<R, P>,
  service: Service<P, A>,
  onError: (e: Error) => Output<T>,
  onSuccess: (a: A) => Output<T>
): Handler<R, T> =>
  pipe(
    requestDecoder,
    chainTaskEitherK(service),
    fold<R, Error, A, Output<T>>(flow(onError, RT.of), flow(onSuccess, RT.of))
  );
