import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
    },

    rules: {
      /*
       * Dinonaktifkan karena pemeriksaan variabel tidak terpakai
       * ditangani oleh eslint-plugin-unused-imports.
       */
      "@typescript-eslint/no-unused-vars": "off",

      /*
       * Import tidak terpakai dianggap error.
       * eslint --fix akan menghapusnya secara otomatis.
       */
      "unused-imports/no-unused-imports": "error",

      /*
       * Variabel dan argument tidak terpakai dianggap error.
       * Awali dengan underscore apabila memang sengaja tidak digunakan.
       *
       * Contoh:
       * function handler(_request: Request) {}
       */
      "unused-imports/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      /*
       * Mengurutkan seluruh import dan export.
       * eslint --fix akan memperbaikinya secara otomatis.
       */
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },

  /*
   * Harus diletakkan setelah konfigurasi rule lainnya.
   */
  eslintConfigPrettier,

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "src/generated/prisma/**",
    "prisma/migrations/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
