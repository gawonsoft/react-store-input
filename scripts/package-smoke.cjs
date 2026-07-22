const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const manifest = require(path.join(root, "package.json"));
const core = require(path.join(root, "dist/index.js"));
const editor = require(path.join(root, "dist/text-editor.js"));
const coreSource = fs.readFileSync(path.join(root, "dist/index.js"), "utf8");

assert.equal(manifest.dependencies["gw-store"], "0.2.0");
assert.equal(manifest.main, "./dist/index.js");
assert.equal(manifest.module, "./dist/index.mjs");
assert.equal(manifest.peerDependenciesMeta["gw-react-text-editor"].optional, true);
assert.equal(typeof core.useFormStore, "function");
assert.equal(typeof core.createRender, "function");
assert.equal(typeof core.useStore, "function");
assert.equal(core.TextEditor, undefined);
assert.equal(typeof editor.TextEditor, "function");
assert.equal(coreSource.includes("gw-react-text-editor"), false);

async function checkEsm() {
  const esmCore = await import("react-store-input");
  const esmEditor = await import("react-store-input/text-editor");

  assert.equal(typeof esmCore.createRender, "function");
  assert.equal(esmCore.TextEditor, undefined);
  assert.equal(typeof esmEditor.TextEditor, "function");
}

checkEsm()
  .then(() => console.log("package smoke test passed"))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
