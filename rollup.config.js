import svelte from "rollup-plugin-svelte";
import postcss from "rollup-plugin-postcss";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import nodeResolve from "rollup-plugin-node-resolve";
import url from "@rollup/plugin-url";
import merge from "deepmerge";

/** @type {import('rollup').RollupOptions} */
const baseConfig = {
  output: {
    dir: "dist",
    sourcemap: "inline",
  },
  plugins: [
    svelte({
      include: "src/**/*.svelte",
      preprocess: sveltePreprocess(),
    }),
    typescript({
      sourceMap: true,
      inlineSources: true,
    }),
    postcss({
      extract: "style.css",
    }),
    nodeResolve(),
    url({ limit: 0 }),
  ],
};

/** @type {import('rollup').RollupOptions} */
export default [
  merge(baseConfig, {
    input: "src/newtab/newtab.ts",
  }),
  merge(baseConfig, {
    input: "src/background_script/background_script.ts",
  }),
  merge(baseConfig, {
    input: "src/content_script/content_script.ts",
  }),
  merge(baseConfig, {
    input: "src/popup/popup.ts",
  }),
];
