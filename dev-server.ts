import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import app from './server-app.js';

dotenv.config();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startLocalServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Marginalia Academic Companion server listening on http://0.0.0.0:${port}`);
  });
}

startLocalServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
