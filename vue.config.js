const { createLoader } = require("simple-functional-loader");
const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

const externals = {
  resolve: "self.resolve",
  chokidar: "self.chokidar",
  purgecss: "self.purgecss",
  tmp: 'self.tmp',
};

const moduleOverrides = {
  fs: path.resolve(__dirname, "src/modules/fs.js"),
};

function getExternal(context, request, callback) {
  if (/node_modules/.test(context) && externals[request]) {
    return callback(null, externals[request]);
  }
  callback();
}

const files = [
  {
    pattern: /modern-noramlize/,
    file: require.resolve("modern-normalize"),
  },
  {
    pattern: /normalize/,
    file: require.resolve("normalize.css"),
  },
  {
    pattern: /preflight/,
    file: path.resolve(
      __dirname,
      "node_modules/tailwindcss/lib/plugins/css/preflight.css"
    ),
  },
];

module.exports = {
  productionSourceMap: false,
  configureWebpack: (config) => {

    config.resolve.alias = { ...config.resolve.alias, ...moduleOverrides };

    config.plugins.push(
      new webpack.DefinePlugin({
        "process.env.TAILWIND_MODE": JSON.stringify("build"),
        "process.env.TAILWIND_DISABLE_TOUCH": true,
      })
    );

    // there's some node-specific stuff in parse-glob
    // we don't use globs though so this can be overridden
    config.module.rules.push({
      test: require.resolve('tailwindcss/node_modules/glob-parent'),
      use: [
        createLoader(function(_source) {
          return `module.exports = () => ''`;
        }),
      ],
    });

    config.module.rules.push({
      test: require.resolve('is-glob'),
      use: [
        createLoader(function(_source) {
          return `module.exports = () => false`;
        }),
      ],
    });

    config.module.rules.push({
      test: require.resolve('tailwindcss/node_modules/fast-glob'),
      use: [
        createLoader(function (_source) {
          return `module.exports = {
            sync: (patterns) => [].concat(patterns)
          }`
        }),
      ],
    })

    config.module.rules.push({
      test: require.resolve("tailwindcss/lib/jit/processTailwindFeatures.js"),
      use: createLoader(function(source) {
        return source.replace(`let warned = false;`, `let warned = true;`);
      }),
    });

    config.module.rules.push({
      test: require.resolve("tailwindcss/lib/plugins/preflight.js"),
      use: createLoader(function(source) {
        return source.replace(
          /_fs\.default\.readFileSync\(.*?'utf8'\)/g,
          (m) => {
            for (let i = 0; i < files.length; i++) {
              if (
                files[i].pattern.test(m)
              ) {
                return (
                  "`" +
                  fs.readFileSync(files[i].file, "utf8").replace(/`/g, "\\`") +
                  "`"
                );
              }
            }
            return m;
          }
        );
      }),
    });

    config.output.globalObject = "self";

    if (config.externals) {
      config.externals.push(getExternal);
    } else {
      config.externals = [getExternal];
    }
  },
};
