import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Pre-bundle the page-head library at server start. If Vite only discovers it
  // mid-session it re-emits it under a new URL, and a screen can then hold two
  // copies whose contexts do not match — that crashes the app on entry.
  optimizeDeps: {
    include: ["react-helmet-async"],
  },
}));
