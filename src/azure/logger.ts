import * as azure from "@azure/functions";

import * as IO from "fp-ts/IO";

import { Logger } from "../log";

export const logger = (ctx: azure.Context): Logger => ({
  log: (message) => IO.of(ctx.log.info(message)),
});
