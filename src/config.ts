import * as fs from "node:fs";
import * as path from "node:path";

const configFilePath = path.join(process.cwd(), "remote-ts-config.json");

export function getConfig() {
  if (fs.existsSync(configFilePath)) {
    const config = fs.readFileSync(configFilePath, "utf-8");
    return JSON.parse(config);
  }
  return null;
}

export function setConfig(rootProjectDir: string) {
  const config = { rootProjectDir };
  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
}
