#!/usr/bin/env node
import { program } from "commander";
import { runServer } from "./runServer";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("custom-env").env();

(async () => {
  program
    .command("api")
    .description("Stars an express-js API server")
    .action(async (options) => {
      runServer(options.port ?? 8080);
    });

  program.parse(process.argv);
})();
