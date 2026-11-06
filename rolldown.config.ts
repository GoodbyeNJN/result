import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";

export default defineConfig({
    input: {
        full: "src/full/index.ts",
        lite: "src/lite/index.ts",
    },

    output: {
        dir: "dist",
        cleanDir: true,
        format: "esm",
    },

    platform: "node",

    plugins: [dts()],
});
