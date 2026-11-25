import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dest = join(root, ".vercel/output/functions/__server.func/_libs");
const src = join(root, "node_modules/@electric-sql/pglite/dist");
const files = ["pglite.data", "pglite.wasm", "initdb.wasm"];

if (!existsSync(dest)) {
  console.log("[pglite] bundle dir missing, skip");
  process.exit(0);
}
mkdirSync(dest, { recursive: true });
for (const name of files) {
  copyFileSync(join(src, name), join(dest, name));
}
console.log("[pglite] copied data and wasm next to the server bundle");
