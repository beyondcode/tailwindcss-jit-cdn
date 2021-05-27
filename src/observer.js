import parseCustomConfig from "./parseCustomConfig";
import { VIRTUAL_SOURCE_PATH, VIRTUAL_HTML_FILENAME } from "./constants";
import tailwindcss from "tailwindcss";
import postcss from "postcss";
import { nanoid } from "nanoid";

const tailwindId = nanoid();

const nodeClassesCache = new WeakMap();

let activeClasses = new Set();

let config = undefined;
export function setConfig(newConfig) {
  config = newConfig;
}

let updateScheduled = false;
export function scheduleUpdate() {
  if (updateScheduled) return;
  updateScheduled = true;
  Promise.resolve().then(runScheduledUpdate);
}
function runScheduledUpdate() {
  if (!updateScheduled) return;
  update();
}

export function update() {
  updateScheduled = false;
  const classes = getClasses(document.documentElement);
  const oldSize = activeClasses.size;
  for (const className of classes.keys()) {
    activeClasses.add(className);
  }
  let updated = activeClasses.size !== oldSize;
  if (updated) {
    // only remove classes when updating anyway
    for (const className of activeClasses) {
      if (!classes.has(className)) {
        activeClasses.delete(className);
      }
    }
  }
  if (updated) {
    runTailwind();
  }
}

function getClasses(node) {
  const cached = nodeClassesCache.get(node);
  if (cached !== undefined) return cached;
  const className = node.className;
  const set = new Set(
    typeof className === "string" && className !== ""
      ? className.trim().split(/\s+/)
      : undefined
  );
  if (node.nodeName === "STYLE" && node.type === "postcss")
    set.add("style\n" + node.innerHTML);
  for (const child of node.childNodes) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      for (const item of getClasses(child)) {
        set.add(item);
      }
    }
  }
  nodeClassesCache.set(node, set);
  return set;
}

export default (records) => {
  const outdatedElements = new Set();
  for (const record of records) {
    outdatedElements.add(record.target);
  }
  for (const node of outdatedElements) {
    nodeClassesCache.delete(node);
    const parent = node.parentNode;
    if (parent) outdatedElements.add(parent);
  }
  scheduleUpdate();
};

let runningTailwind = undefined;
let runningTailwindOutdated = false;
function runTailwind() {
  if (runningTailwind) {
    runningTailwindOutdated = true;
  } else {
    runningTailwind = tailwindRunner();
  }
}

async function tailwindRunner() {
  do {
    try {
      runningTailwindOutdated = false;
      const classes = [];
      let customCss = "";
      for (const item of activeClasses) {
        if (item.startsWith("style\n")) {
          customCss += item.slice(5);
        } else {
          classes.push(item);
        }
      }
      self[VIRTUAL_HTML_FILENAME] = `<div class="${classes.join(
        " "
      )}"></div><style>${customCss}</style>`;

      let userConfig = config || parseCustomConfig();

      let defaultConfig = {
        theme: {},
        plugins: [
          require("@tailwindcss/forms"),
          require("@tailwindcss/typography"),
          require("@tailwindcss/aspect-ratio"),
          require("@tailwindcss/line-clamp"),
        ],
      };

      const result = await postcss([
        tailwindcss({
          ...defaultConfig,
          ...userConfig,
          mode: "jit",
          purge: [VIRTUAL_HTML_FILENAME],
        }),
      ]).process(
        `@tailwind base;
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
    } catch (err) {
      console.error("Tailwind failed: " + err);
    }
  } while (runningTailwindOutdated);
  runningTailwind = undefined;
}
