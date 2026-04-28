import { createRequire } from "module";

const require = createRequire(import.meta.url);
const rootConfig = require("../tailwind.config.js");

/** @type {import('tailwindcss').Config} */
export default {
  ...rootConfig,
  content: [
    ...(rootConfig.content ?? []),
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../src/**/*.{js,ts,jsx,tsx}",
  ],
};
