#!/usr/bin/env node

import { getArgs } from "./utils/getArgs.js";
import { syncProjects } from "./sync.js";
import { getConfig, setConfig } from "./config.js";
import inquirer from "inquirer";
import chalk from "chalk";

async function promptForRootProjectDir(): Promise<string> {
  const { rootProjectDir } = await inquirer.prompt([
    {
      type: "input",
      name: "rootProjectDir",
      message: "Please provide the path to your root project directory:",
      validate: (input) => {
        if (input.trim() === "") {
          return "Root project directory cannot be empty.";
        }
        return true;
      },
    },
  ]);
  return rootProjectDir;
}

async function main() {
  //@ts-ignore
  const { _: args } = getArgs();
  let config = getConfig();

  if (!config) {
    const rootProjectDir = await promptForRootProjectDir();
    setConfig(rootProjectDir);
    config = { rootProjectDir };
  }

  const rootProjectDir = config.rootProjectDir;

  if (args.length === 0) {
    console.error('No command provided. Use "sync" to synchronize types.');
    process.exit(1);
  }

  const command = args[0];

  if (command === "sync") {
    syncProjects(rootProjectDir);
  } else if (command === "reset-root") {
    try {
      const rootProjectDir = await promptForRootProjectDir();
      setConfig(rootProjectDir);
      console.log(
        chalk.greenBright("Root project directory reset successfully."),
      );
    } catch (error: any) {
      console.log(chalk.red("Failed to set root project directory."));
      console.error(error.message);
      process.exit(1);
    }
  } else {
    console.error(`Unknown command: ${command}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("An error occurred:", error);
  process.exit(1);
});
