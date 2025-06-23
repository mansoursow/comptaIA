import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ✅ Pas d'await en haut, tout dans async
export default defineConfig(async () => {
  return {
    plugins: [react()],
    build: {
      outDir: "dist/public", // ← nécessaire si tu sers le frontend avec Express
    },
  };
});
