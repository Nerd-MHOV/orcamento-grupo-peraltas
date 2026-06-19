/// <reference types="vitest" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isVitest = !!process.env.VITEST;
  return {
    // Fast Refresh injeta um preamble incompativel com o ambiente jsdom do vitest;
    // desabilita apenas nos testes, mantendo dev/build inalterados.
    plugins: [react({ fastRefresh: !isVitest })],
    define: {
      'process.env': env
    },
    test: {
      globals: true,
      environment: "node",
    },
  };
});
