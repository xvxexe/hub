import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this project at /hub/ because the repository is named "hub".
// Keep local development on / so `npm run dev` works normally.
const isGitHubPages = process.env.GITHUB_PAGES === 'true'

export default defineConfig({
  base: isGitHubPages ? '/hub/' : '/',
  plugins: [react()],
})
