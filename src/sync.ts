import * as fs from "node:fs";
import * as path from "node:path";
import chalk from "chalk";

function readGitignore(dir: string): Set<string> {
  const gitignorePath = path.join(dir, ".gitignore");
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, "utf-8");
    return new Set(
      content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#")),
    );
  }
  return new Set();
}

function isIgnored(filePath: string, ignoredPaths: Set<string>): boolean {
  const relativePath = path.relative(process.cwd(), filePath);
  return (
    ignoredPaths.has(relativePath) || relativePath.startsWith("node_modules/")
  );
}

function findAllTSFiles(dir: string, ignoredPaths: Set<string>): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    // biome-ignore lint/complexity/useOptionalChain: <explanation>
    if (stat && stat.isDirectory()) {
      // Skip ignored directories
      if (!isIgnored(filePath, ignoredPaths)) {
        // Recursively search in subdirectories
        results = results.concat(findAllTSFiles(filePath, ignoredPaths));
      }
    } else if (file.endsWith(".ts") && !isIgnored(filePath, ignoredPaths)) {
      results.push(filePath);
    }
  });

  return results;
}

export function syncProjects(rootProjectDir: string) {
  const currentDir = process.cwd();
  const remoteDir = path.join(currentDir, ".remote-ts");

  if (!fs.existsSync(remoteDir)) {
    try {
      fs.mkdirSync(remoteDir);
    } catch (error) {
      throw new Error(`Failed to create .remote-ts directory: ${error}`);
    }
  } else {
    try {
      fs.rmSync(remoteDir, { recursive: true, force: true });
      fs.mkdirSync(remoteDir);
    } catch (error) {
      throw new Error(`Failed to clean up .remote-ts directory: ${error}`);
    }
  }

  // Read ignored paths from .gitignore
  const ignoredPaths = readGitignore(currentDir);

  // Start timing
  const startTime = Date.now();

  // Find all TypeScript files in the current project, including subdirectories
  const tsFiles = findAllTSFiles(currentDir, ignoredPaths);
  let filesCopied = 0;

  // Regex to find import paths that include "remote-ts"
  const regex =
    /import\s+(?:type\s+)?\{[^}]+\}\s+from\s+['"]\.[^r]*\/.remote-ts\/([^'"]+)['"]/g;

  tsFiles.forEach((file) => {
    const content = fs.readFileSync(file, "utf-8");

    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      const importPath = match[1]; // Get the path after "remote-ts/"
      const sourceFilePath = path.join(rootProjectDir, importPath);

      // Ensure the destination path in .remote-ts matches the import path
      const destFilePath = path.join(remoteDir, importPath);

      // Create the destination directory if it doesn't exist
      const destDir = path.dirname(destFilePath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      if (fs.existsSync(sourceFilePath)) {
        fs.copyFileSync(sourceFilePath, destFilePath);
        console.log(
          chalk.gray(
            `Copied ${chalk.white(sourceFilePath.replace(rootProjectDir, ""))}`,
          ),
        );
        filesCopied++;
      } else {
        console.log();
        console.log(chalk.red(`Remote TS source file not found: ${chalk.white(sourceFilePath)}`));
        console.log(chalk.red(`From: ${chalk.white(file)}`));
        console.log();
      }
    }
  });

  // Calculate duration
  const duration = Date.now() - startTime;

  // Log the results
  console.log("");
  console.log(
    chalk.gray(
      `Checked ${chalk.white(tsFiles.length)} files. Synchronized ${chalk.white(filesCopied)} files. In ${chalk.white(duration)}ms.`,
    ),
  );
}
