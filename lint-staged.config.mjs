/** @type {import("lint-staged").Configuration} */
const config = {
  "*.{js,jsx,ts,tsx,mjs,cjs}": ["eslint --fix --max-warnings=0", "prettier --write"],

  "*.{json,css,scss,md,mdx,yml,yaml}": ["prettier --write"],

  "prisma/schema.prisma": () => "prisma format",
};

export default config;
