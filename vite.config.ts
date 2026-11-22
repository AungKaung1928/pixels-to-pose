/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The style test reads the colour tokens from the real stylesheet; vitest stubs CSS otherwise.
  test: { css: { include: [/index\.css/] } },
})
