import express from 'express';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const server = createServer(app);

const dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(dirname, '../../client/dist');

app.use(express.static(clientDist));

app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

const port = Number(process.env['PORT'] ?? 3000);
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
