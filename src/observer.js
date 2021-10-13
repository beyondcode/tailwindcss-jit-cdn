import parseCustomConfig from "./parseCustomConfig";
import { VIRTUAL_SOURCE_PATH, VIRTUAL_HTML_FILENAME } from "./constants";
import tailwindcss from "tailwindcss";
import postcss from "postcss";
import autoprefixer from "autoprefixer";
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
      purge: [],
      theme: {},
      plugins: [
        require("@tailwindcss/forms"), 
        require("@tailwindcss/typography"),
        require("@tailwindcss/aspect-ratio"),
        require("@tailwindcss/line-clamp")
      ],
    };

    const combinedConfig = {
      ...defaultConfig,
      ...userConfig
    }

    combinedConfig.purge.push(VIRTUAL_HTML_FILENAME)

    let customCss = '';
    document.querySelectorAll('style[type="postcss"]').forEach(styleTag => {
      customCss += styleTag.innerHTML;
    })

    const result = await postcss([
      tailwindcss(combinedConfig),
      autoprefixer({})
    ]).process(
      `
      @tailwind base;
      @tailwind components;
      ${customCss}
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