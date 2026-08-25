import puppeteer from 'puppeteer';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const getBlogRoutes = () => {
  try {
    const cmsPath = path.resolve(__dirname, './backend/data/cms.json');
    const cmsData = JSON.parse(fs.readFileSync(cmsPath, 'utf-8'));
    return (cmsData.blogs || []).map(blog => `/blog/${blog.slug}`);
  } catch (error) {
    return [];
  }
};

const routesToPrerender = [
  '/',
  '/hakkinda',
  '/projeler',
  '/blog',
  '/iletisim',
  '/futbolmeydani-privacy',
  ...getBlogRoutes()
];

const startPrerender = async () => {
  const app = express();
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // SPA fallback
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

  const server = app.listen(45678, async () => {
    console.log('Static server running on port 45678 for prerendering...');
    
    try {
      const browser = await puppeteer.launch({ headless: 'new' });
      const page = await browser.newPage();
      
      for (const route of routesToPrerender) {
        console.log(`Prerendering ${route}...`);
        await page.goto(`http://localhost:45678${route}`, { waitUntil: 'networkidle0' });
        
        // Wait an extra second just in case there are some late React states
        await new Promise(r => setTimeout(r, 1000));
        
        const content = await page.content();
        
        let filePath;
        if (route === '/') {
          filePath = path.join(__dirname, 'dist', 'index.html');
        } else {
          filePath = path.join(__dirname, 'dist', `${route}.html`);
          const dir = path.dirname(filePath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
        }
        
        fs.writeFileSync(filePath, content);
        console.log(`Saved ${route}`);
      }
      
      await browser.close();
      server.close();
      console.log('Prerendering complete!');
      process.exit(0);
    } catch (err) {
      console.error('Error during prerender:', err);
      server.close();
      process.exit(1);
    }
  });
};

startPrerender();
