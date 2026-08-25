import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'
import path from 'path'
import fs from 'fs'

// Read blogs from cms.json for sitemap generation
const getBlogRoutes = () => {
  try {
    const cmsPath = path.resolve(__dirname, './backend/data/cms.json');
    const cmsData = JSON.parse(fs.readFileSync(cmsPath, 'utf-8'));
    return (cmsData.blogs || []).map(blog => `/blog/${blog.slug}`);
  } catch (error) {
    console.error("Could not read cms.json for sitemap generation", error);
    return [];
  }
};

const blogRoutes = getBlogRoutes();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    Sitemap({
      hostname: 'https://geidostudio.com',
      dynamicRoutes: [
        '/hakkinda',
        '/projeler',
        '/blog',
        '/iletisim',
        '/futbolmeydani-privacy',
        ...blogRoutes
      ]
    })
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-functions']
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5175,
    allowedHosts: ['jaquelyn-vitreum-collene.ngrok-free.dev', 'all'],
    proxy: {
      '/api': {
        target: 'http://localhost:3005',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
