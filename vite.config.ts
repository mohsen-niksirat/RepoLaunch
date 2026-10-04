import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// relative base => works on GitHub Pages project sites (user.github.io/repolaunch)
export default defineConfig({
  plugins: [react()],
  base: './',
})
