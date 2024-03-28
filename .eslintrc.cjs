require("@rushstack/eslint-patch/modern-module-resolution");

const path = require("node:path");
const createAliasSetting = require("@vue/eslint-config-airbnb/createAliasSetting");

module.exports = {
  // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
  // This option interrupts the configuration hierarchy at this file
  // Remove this if you have an higher level ESLint config file (it usually happens into a monorepos)
  root: true,

  // Rules order is important, please avoid shuffling them
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "plugin:vue-pug/vue3-recommended",
    "@vue/eslint-config-airbnb-with-typescript",
    "@vue/eslint-config-airbnb-with-typescript/allow-js-in-vue",
    "plugin:jsdoc/recommended",
    "plugin:sonarjs/recommended",
    "plugin:optimize-regex/recommended",
    "plugin:regexp/recommended",
    "@vue/eslint-config-prettier",
  ],

  plugins: ["simple-import-sort"],

  globals: {
    ga: "readonly", // Google Analytics
    cordova: "readonly",
    __statics: "readonly",
    __QUASAR_SSR__: "readonly",
    __QUASAR_SSR_SERVER__: "readonly",
    __QUASAR_SSR_CLIENT__: "readonly",
    __QUASAR_SSR_PWA__: "readonly",
    process: "readonly",
    Capacitor: "readonly",
    chrome: "readonly",
  },

  // add your custom rules here
  rules: {
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "jsdoc/tag-lines": 0,
    "jsdoc/require-jsdoc": [
      "error",
      {
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true,
          ClassExpression: true,
          ArrowFunctionExpression: true,
          FunctionExpression: true,
        },
      },
    ],
    // allow debugger during development only
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
  },
  settings: {
    ...createAliasSetting({
      "@": `${path.resolve(__dirname, "./src")}`,
      "~": `${path.resolve(__dirname, ".")}`,
    }),
  },
};
