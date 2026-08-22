import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    allowedHosts: ["e30f4fbdbdd6d670-106-219-123-212.serveousercontent.com"],
  },
  plugins: [react(), tailwindcss()],
});
