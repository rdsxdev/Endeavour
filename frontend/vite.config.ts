import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    allowedHosts: ["e3b9ce5818cd683c-106-219-123-212.serveousercontent.com"],
  },
  plugins: [react(), tailwindcss()],
});
