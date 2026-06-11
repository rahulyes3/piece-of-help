import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const root = resolve(process.cwd());
const port = Number(process.env.PORT) || 3000;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    const safePath = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;
    const filePath = join(root, safePath);
    const fileStat = await stat(filePath);

    if (fileStat.isDirectory()) {
      response.writeHead(301, { Location: '/' });
      response.end();
      return;
    }

    const contentType = mimeTypes[extname(filePath).toLowerCase()] || 'application/octet-stream';
    response.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    createReadStream(filePath).pipe(response);
  } catch (error) {
    const notFound = error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT';
    if (notFound) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Server error');
  }
});

server.listen(port, () => {
  console.log(`Piece of Help is running at http://localhost:${port}`);
});
