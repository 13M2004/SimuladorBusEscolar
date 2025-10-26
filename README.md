import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint que devuelve los datos de las rutas
app.get('/api/routes', (req, res) => {
  const ruta = path.join(__dirname, 'public', 'routes', 'data.json');
  const data = JSON.parse(fs.readFileSync(ruta, 'utf8'));
  res.json(data);
});

// Página principal
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚍 Servidor activo en http://localhost:${PORT}`));
