/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/musico/",
  plugins: [react()],
  define: {
    "process.env": {},
  },
  build: {
    outDir: "build",
  },
  // server: {
  //   origin: "http://localhost:3000",
  //   // host: "117.241.237.162",
  //   host: true,
  //   fs: {
  //     strict: true,
  //   },
  //   open: true,
  // },
});
