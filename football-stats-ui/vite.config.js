import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Minden /api kezdetű kérést továbbít a .NET API felé
      "/api": {
        target: "http://localhost:5023",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
