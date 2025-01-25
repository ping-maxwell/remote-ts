import * as fs from "node:fs";
import * as path from "node:path";

// Determine the appropriate config directory based on the OS
const configDir = process.platform === 'win32'
  ? path.join(process.env.APPDATA || '', 'remote-ts')
  : path.join(process.env.HOME || '', '.config', 'remote-ts');

const configFilePath = path.join(configDir, 'remote-ts-config.json');

// Ensure the config directory exists
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

export function getConfig() {
  if (fs.existsSync(configFilePath)) {
    const config = fs.readFileSync(configFilePath, 'utf-8');
    return JSON.parse(config);
  }
  return null;
}

export function setConfig(rootProjectDir: string) {
  const config = { rootProjectDir };
  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
}
