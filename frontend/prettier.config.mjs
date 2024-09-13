export default {
  trailingComma: "es5",
  semi: true,
  tabWidth: 2,
  singleQuote: false,
  jsxSingleQuote: false,
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  importOrder: [
    "^(react/(.*)$)|^(react$)",
    "",
    "<THIRD_PARTY_MODULES>",
    "",
    "^[./]",
  ],
  tailwindFunctions: ["clsx", "cn"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};
