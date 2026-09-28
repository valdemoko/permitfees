import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    reporters: ["default"],
    /**
     * Vitest does not populate `process.env` from `.env.local`, so the database
     * integration suite would skip on a machine that has a database configured.
     * The setup file loads the environment through the project's shared loader.
     */
    setupFiles: ["tests/setup-env.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      /**
       * `server-only` throws on import outside a React Server Component context.
       * The suites exercise the real query layer and the real route components,
       * which are server code by design, so tests resolve it to the empty server
       * export the way Next does when compiling a server component. Aliasing the
       * specifier (rather than setting the `react-server` condition) achieves
       * that *without* serving React's server-only build — which lacks
       * `createContext` and breaks `next/link` — and without serving the
       * `react-dom/server` stub that throws on import.
       */
      "server-only": fileURLToPath(new URL("./node_modules/server-only/empty.js", import.meta.url)),
      /**
       * The route-flow tests render the real page components with
       * `renderToStaticMarkup`, so `react-dom/server` must resolve to the plain
       * Node build rather than the edge/browser variants condition resolution
       * would otherwise pick.
       */
      "react-dom/server": fileURLToPath(
        new URL("./node_modules/react-dom/server.node.js", import.meta.url),
      ),
    },
  },
});
