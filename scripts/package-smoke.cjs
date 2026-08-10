const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const manifest = require(path.join(root, "package.json"));
const core = require(path.join(root, "dist/index.js"));
const editor = require(path.join(root, "dist/text-editor.js"));
const coreSource = fs.readFileSync(path.join(root, "dist/index.js"), "utf8");

assert.equal(manifest.version, "0.6.0");
assert.equal(manifest.dependencies["gw-store"], "0.2.0");
assert.equal(manifest.dependencies["gw-result"], "0.3.0");
assert.equal(manifest.main, "./dist/index.js");
assert.equal(manifest.module, "./dist/index.mjs");
assert.equal(manifest.peerDependenciesMeta["gw-rich-text-editor"].optional, true);
assert.equal(core.useFormStore, undefined);
assert.equal(core.useStoreComponent, undefined);
assert.equal(core.useStoreController, undefined);
assert.equal(typeof core.useStoreBinding, "function");
assert.equal(typeof core.useStoreInput, "function");
assert.equal(typeof core.useStoreHTMLElement, "function");
assert.equal(typeof core.createRender, "function");
assert.equal(core.useStore, undefined);
assert.equal(typeof core.defineBinding, "function");
assert.equal(typeof core.defineCodec, "function");
assert.equal(typeof core.stateLens, "function");
assert.equal(typeof core.ok, "function");
assert.equal(typeof core.err, "function");
assert.equal(core.TextEditor, undefined);
assert.equal(typeof editor.TextEditor, "function");
assert.equal(coreSource.includes("gw-rich-text-editor"), false);

async function checkEsm() {
  const esmCore = await import("react-store-input");
  const esmEditor = await import("react-store-input/text-editor");

  assert.equal(typeof esmCore.createRender, "function");
  assert.equal(typeof esmCore.useStoreBinding, "function");
  assert.equal(typeof esmCore.useStoreInput, "function");
  assert.equal(typeof esmCore.useStoreHTMLElement, "function");
  assert.equal(typeof esmCore.defineBinding, "function");
  assert.equal(typeof esmCore.ok, "function");
  assert.equal(esmCore.TextEditor, undefined);
  assert.equal(typeof esmEditor.TextEditor, "function");
}

checkEsm()
  .then(() => console.log("package smoke test passed"))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
