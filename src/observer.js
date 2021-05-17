import parseCustomConfig from "./parseCustomConfig";
import { VIRTUAL_SOURCE_PATH, VIRTUAL_HTML_FILENAME } from "./constants";
import tailwindcss from "tailwindcss";
import postcss from "postcss";
import { nanoid } from "nanoid";

const tailwindId = nanoid();

let lastProcessedHtml = "";

export default (force = false) => {
  return async () => {
    self[VIRTUAL_HTML_FILENAME] = document.documentElement.outerHTML;

    if (self[VIRTUAL_HTML_FILENAME] === lastProcessedHtml && force === false) {
      return;
    }

    let userConfig = parseCustomConfig();

    lastProcessedHtml = self[VIRTUAL_HTML_FILENAME];

    let defaultConfig = {
      mode: "jit",
      purge: [VIRTUAL_HTML_FILENAME],
      theme: {},
      plugins: [],
    };

    const result = await postcss([
      tailwindcss({ ...defaultConfig, ...userConfig }),
    ]).process(
      `
      @tailwind base;
      @tailwind components;
      @tailwind utilities;
      `,
      {
        from: VIRTUAL_SOURCE_PATH,
      }
    );

    let style = document.getElementById(tailwindId);

    if (style === null) {
      style = document.createElement("style");
      style.id = tailwindId;
      document.head.append(style);
    }

    style.textContent = result.css;
  };
};