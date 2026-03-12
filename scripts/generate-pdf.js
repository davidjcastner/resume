import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { preview } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pdfPath = path.resolve(__dirname, '../docs/David_Castner_Resume.pdf');

// Serve the built docs/ via HTTP so Google Fonts and assets load correctly
const server = await preview({
  root: 'src',
  base: './',
  build: { outDir: '../docs' },
  preview: { port: 4173, open: false },
});

const browser = await puppeteer.launch();
const page = await browser.newPage();

// Match the browser viewport to the resume dimensions (8.5in x 11in at 96dpi)
await page.setViewport({ width: 816, height: 1056 });

// Use screen media so the PDF matches what you see in the browser
await page.emulateMediaType('screen');

await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });

// Wait for all fonts (including Google Fonts) to finish loading
await page.evaluateHandle(() => document.fonts.ready);

await page.pdf({
  path: pdfPath,
  width: '8.5in',
  height: '11in',
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});

await browser.close();
server.httpServer.close();
console.log(`PDF saved to ${pdfPath}`);
