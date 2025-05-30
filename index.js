#!/usr/bin/env node
const fs = require("fs");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { findPatternsInText } = require("./lib/checkForSecrets");
const { addFileToIgnoredFilesList } = require("./lib/ignoreFile");

const parameters = ["help", "git-cached", "all-files", "add <file-path>"];

(async () => {
  process.stdout.write("\n🟡 Checking for not allowed patterns\n");

  let notAllowedFiles = await checkForSecrets();

  if (notAllowedFiles != null && notAllowedFiles.length > 0) {
    process.stdout.write("\n\n🔴 Files with not allowed patterns found:\n");
    for (let index = 0; index < notAllowedFiles.length; index++) {
      const matchedFile = notAllowedFiles[index];
      console.log(matchedFile);
    }

    process.stdout.write("\n");
    process.stdout.write("All the files must be checked and fixed!\n\n");
    process.exit(1);
  }

  process.stdout.write("\n\n🟢 No bad patterns found 🙂\n\n");
  process.exit(0);
})();

async function checkForSecrets() {
  let arguments = process.argv.slice(2);

  ValidateArguments(arguments);

  let checkForSecretsConfig = GetConfigParameters();

  const ignoredFiles = checkForSecretsConfig.ignoredFiles;
  const ignoredDirectories = checkForSecretsConfig.ignoredDirectories;
  const patterns = checkForSecretsConfig.patterns;

  if (arguments[0] === "git-cached") {
    return checkForGitCachedFiles(ignoredFiles, ignoredDirectories, patterns);
  }

  if (arguments[0] === "all-files") {
    return checkForAllFiles(ignoredFiles, ignoredDirectories, patterns);
  }

  if (arguments[0] === "add") {
    return addFileToIgnoredFilesList(arguments[1]);
  }
}

function ValidateArguments(arguments) {
  if (arguments.length <= 0 || arguments[0] === null) {
    console.log("No arguments were informed.\n");
    console.log("Use the parameter `help` to check avaliable options\n");
    process.exit(1);
  }

  if (!parameters.includes(arguments[0])) {
    console.log("Invalid argument.\n");
    console.log("Use the parameter `help` to check avaliable options\n");
    process.exit(1);
  }

  if (arguments[0].indexOf(parameters[0]) >= 0) {
    process.stdout.write("\n\nUsage:\n");
    process.stdout.write("help - show avaliable parameters\n");
    process.stdout.write(
      "git-cached - looks for the staged files and check for not allowed patterns\n",
    );
    process.stdout.write(
      "all-files - looks for all files in the repository and check for not allowed patterns\n",
    );
    process.stdout.write(
      "add <file-path> - add file to ignored files list (e.g. check-for-secrets add src/path/to/file.js)\n",
    );
    process.stdout.write("\n\n");

    process.exit(0);
  }
}

function GetConfigParameters() {
  let checkForSecretsConfig = null;

  try {
    checkForSecretsConfig = require("../../checkforsecrets.config.json");
  } catch (error) {
    console.log(
      "Using standard config. You can add your own config by creating a `checkforsecrets.config.json` file on your main directory.\n",
    );
  }

  if (checkForSecretsConfig == null)
    checkForSecretsConfig = require("../check-for-secrets/checkforsecrets.config.json");
  return checkForSecretsConfig;
}

async function checkForGitCachedFiles(
  ignoredFiles,
  ignoredDirectories,
  patterns,
) {
  process.stdout.write("🟡 Looking for git cached files...\n");
  try {
    let notAllowedFiles = [];

    let execReturn = await exec("git diff --cached --name-only");
    if (execReturn.stdout !== null) {
      let files = execReturn.stdout.split("\n");

      if (files.length <= 1) {
        process.stdout.write(
          "\n\n🟡 No git cached files found. You must `git add` the changed files, so they can be checked. 🤔\n\n",
        );
        process.exit(0);
      }

      for (let index = 0; index < files.length; index++) {
        const filePath = files[index];

        if (filePath === "") continue;

        if (ignoredFiles.includes(filePath)) {
          console.log("ignored files: ", filePath);
          continue;
        }

        if (ignoredDirectories.some((dir) => filePath.startsWith(dir))) {
          console.log(
            "ignored directories: ",
            ignoredDirectories.find((dir) => filePath.startsWith(dir)),
            "->",
            filePath,
          );
          continue;
        }

        if (!fs.existsSync(filePath)) {
          continue;
        }

        const data = await fs.promises.readFile(filePath, "utf8");

        notAllowedFiles.push(...findPatternsInText(filePath, data, patterns));

        if (notAllowedFiles.length > 0) {
          return notAllowedFiles;
        }
      }

      return notAllowedFiles;
    }
  } catch (error) {
    process.stdout.write("Error when running git-cached validation.\n");
    if (process.stderr.find("usage: git diff [<options>]")) {
      process.stdout.write(
        "Invallid git diff cached command. Contact the creator for help.\n",
      );
      process.exit(1);
    }

    if (
      process.stderr.find("git: command not found") ||
      process.stderr.find(
        "'git' is not recognized as an internal or external command",
      )
    ) {
      process.stdout.write("Make sure git is installed in your system.\n");
      process.exit(1);
    }
  }
}

async function checkForAllFiles(ignoredFiles, ignoredDirectories, patterns) {
  process.stdout.write("🟡 Looking for all files in the repository...\n");

  try {
    let notAllowedFiles = [];
    let { stdout } = await exec("git ls-files");

    let files = stdout.split("\n").filter((file) => file.trim() !== "");

    for (const filePath of files) {
      if (ignoredFiles.includes(filePath)) {
        console.log("ignored file: ", filePath);
        continue;
      }

      if (ignoredDirectories.some((dir) => filePath.startsWith(dir))) {
        console.log(
          "ignored directories: ",
          ignoredDirectories.find((dir) => filePath.startsWith(dir)),
          "->",
          filePath,
        );
        continue;
      }

      const data = await fs.promises.readFile(filePath, "utf8");

      notAllowedFiles.push(...findPatternsInText(filePath, data, patterns));
    }

    return notAllowedFiles;
  } catch (error) {
    console.error("Error when checking all files:", error);
    process.exit(1);
  }
}
