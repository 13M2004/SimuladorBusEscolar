// ============================================================
// 🌐 server.js — Servidor principal del Simulador de Bus Escolar
// Colegio Genius Americano | Proyecto de Investigación de Operaciones
// ============================================================

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ============================================================
// 📁 CONFIGURACIONES BÁSICAS
// ============================================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================
// 📦 ARCHIVOS ESTÁTICOS
// ============================================================
// Sirve todo el contenido público (HTML, CSS, JS, imágenes, JSON)
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// 🗺️ ENDPOINTS DE DATOS (rutas simuladas Dijkstra / Kruskal)
// ============================================================

// 🚌 Rutas generales
app.get('/api/routes', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'routes', 'data.json');
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json(data);
  } catch (error) {
    console.error('❌ Error al cargar data.json:', error.message);
    res.status(500).json({ error: 'No se pudieron obtener las rutas' });
  }
});

// 📍 Rutas específicas de Dijkstra
app.get('/api/routes/dijkstra', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'routes', 'data_dijkstra.json');
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json(data);
  } catch (error) {
    console.error('❌ Error al cargar data_dijkstra.json:', error.message);
    res.status(500).json({ error: 'No se pudieron obtener los datos de Dijkstra' });
  }
});

// 🌉 Rutas específicas de Kruskal
app.get('/api/routes/kruskal', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'routes', 'data_kruskal.json');
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json(data);
  } catch (error) {
    console.error('❌ Error al cargar data_kruskal.json:', error.message);
    res.status(500).json({ error: 'No se pudieron obtener los datos de Kruskal' });
  }
});

// ============================================================
// 🏠 RUTA PRINCIPAL (Login)
// ============================================================
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================================
// 🚦 MANEJO DE RUTAS DESCONOCIDAS
// ============================================================
// Si se solicita un archivo no existente, muestra mensaje amigable
app.use((_req, res) => {
  res.status(404).send(`
    <h1>❌ 404 - Página no encontrada</h1>
    <p>La ruta solicitada no existe en el servidor.</p>
    <a href="/">Volver al inicio</a>
  `);
});

// ============================================================
// 🚀 INICIAR SERVIDOR
// ============================================================
app.listen(PORT, () => {
  console.log(`✅ Servidor activo en: http://localhost:${PORT}`);
  console.log('📂 Serviendo contenido desde:', path.join(__dirname, 'public'));
});
