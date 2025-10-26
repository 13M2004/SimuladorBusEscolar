// ============================================================
// 🎓 Tutora.js — Panel de Tutora (Mapa + Recorrido del Bus)
// Proyecto: Simulador de Ruta Escolar | Colegio Genius Americano
// ============================================================

import { MessageBoard } from '../components/MessageBoard.js';
import { BusController } from '../components/BusController.js';

document.addEventListener('DOMContentLoaded', async () => {
  // ============================================================
  // 📦 Referencias del DOM
  // ============================================================
  const messageBoard   = new MessageBoard('message-container');
  const routeSelector  = document.getElementById('routeSelector');
  const logoutBtn      = document.getElementById('logout');
  const userInfo       = document.getElementById('user-info');
  const paradasList    = document.getElementById('paradas-list');
  const btnAprende     = document.getElementById('btnAprende');
  const btnIniciar     = document.getElementById('btnIniciar');
  const btnPausar      = document.getElementById('btnPausar');
  const btnContinuar   = document.getElementById('btnContinuar');
  const learnPanel     = document.getElementById('learn-panel');
  const mapContainer   = document.getElementById('map');
  const btnVolverMapa  = document.getElementById('btnVolverMapa');
  const learnBox       = document.querySelector('.learn-box');

  // ============================================================
  // 👩‍🏫 Sesión
  // ============================================================
  const session = JSON.parse(localStorage.getItem('session'));
  if (session && session.name) {
    userInfo.textContent = `👩‍🏫 ${session.name}`;
  } else {
    window.location.href = 'index.html';
    return;
  }

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('session');
    window.location.href = 'index.html';
  });

  // ============================================================
  // 🗺️ Leaflet
  // ============================================================
  const map = L.map('map').setView([14.2919, -89.8960], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  const iconBus       = L.icon({ iconUrl: 'assets/icons/BusEscolar.png', iconSize: [42, 42] });
  const iconColegio   = L.icon({ iconUrl: 'assets/icons/Colegio.png',     iconSize: [38, 38] });
  const iconGasolinera= L.icon({ iconUrl: 'assets/icons/Gasolinera.png',  iconSize: [34, 34] });
  const iconParada    = L.icon({ iconUrl: 'assets/icons/Paradas.png',     iconSize: [28, 28] });

  // Estado
  let rutaData = null;
  let bus = null;
  let estadoBus = 'idle'; // 'idle' | 'running' | 'paused'

  // ============================================================
  // 📘 Cargar ruta
  // ============================================================
  routeSelector.addEventListener('change', async (e) => {
    const fileName = e.target.value;
    await cargarRuta(fileName);
  });

  async function cargarRuta(fileName) {
    try {
      const res = await fetch(`routes/${fileName}`);
      rutaData = await res.json();
      if (!rutaData?.route) throw new Error('Ruta inválida');

      // Lista de paradas
      paradasList.innerHTML = '';
      const liInicio = document.createElement('li');
      liInicio.textContent = `⛽ Gasolinera Papigaso (Inicio)`;
      paradasList.appendChild(liInicio);

      rutaData.route.forEach((p, i) => {
        if (i > 0 && i < rutaData.route.length - 1) {
          const li = document.createElement('li');
          li.textContent = p.nombre;
          li.id = `parada-${i}`;
          paradasList.appendChild(li);
        }
      });

      const liFin = document.createElement('li');
      liFin.textContent = `🏫 Colegio Genius Americano (Final)`;
      paradasList.appendChild(liFin);

      // Limpiar capas anteriores
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) map.removeLayer(layer);
      });
      // Redibujar
      const coords = rutaData.route.map(p => [p.lat, p.lng]);
      L.polyline(coords, { color: '#2e7d32', weight: 4 }).addTo(map);
      L.marker(coords[0], { icon: iconGasolinera }).addTo(map).bindPopup('⛽ Inicio - Gasolinera Papigaso');
      L.marker(coords.at(-1), { icon: iconColegio }).addTo(map).bindPopup('🏫 Colegio Genius Americano');
      rutaData.route.forEach((p, i) => {
        if (i > 0 && i < rutaData.route.length - 1) {
          const offset = 0.00025 * (i % 2 === 0 ? 1 : -1);
          L.marker([p.lat + offset, p.lng + offset], { icon: iconParada })
            .addTo(map)
            .bindPopup(`🧍 Parada ${i}: ${p.nombre}`);
        }
      });
      map.fitBounds(coords);

      // Reiniciar bus/estado
      bus = null;
      estadoBus = 'idle';
      messageBoard.show(`📘 ${rutaData.nombreRuta} cargada (${rutaData.horario})`, 4000, 'success');
    } catch (err) {
      console.error(err);
      messageBoard.show('⚠️ No se pudo cargar la ruta.', 4000, 'error');
    }
  }

  // ============================================================
  // ▶️ Controles de recorrido (sin bloqueos por estado)
  // ============================================================
  btnIniciar.addEventListener('click', async () => {
    if (!rutaData) {
      messageBoard.show('⚠️ Primero selecciona una ruta.', 3000, 'warning');
      return;
    }
    if (!bus) bus = new BusController(map, rutaData.route, iconBus);

    // marcamos running ANTES del await para evitar la carrera
    estadoBus = 'running';
    try {
      await bus.start();
      messageBoard.show('▶️ Recorrido iniciado correctamente.', 3000, 'success');
    } catch (e) {
      estadoBus = 'idle';
      console.error(e);
      messageBoard.show('⚠️ No se pudo iniciar el recorrido.', 3000, 'error');
    }
  });

  btnPausar.addEventListener('click', () => {
    if (!bus) {
      messageBoard.show('⚠️ No hay recorrido activo para pausar.', 3000, 'warning');
      return;
    }
    // ejecutamos siempre; BusController debería ser idempotente
    bus.pause();
    estadoBus = 'paused';
    messageBoard.show('⏸️ Recorrido pausado.', 3000, 'info');
  });

  btnContinuar.addEventListener('click', () => {
    if (!bus) {
      messageBoard.show('⚠️ No hay recorrido pausado para continuar.', 3000, 'warning');
      return;
    }
    bus.continue();
    estadoBus = 'running';
    messageBoard.show('▶️ Recorrido reanudado correctamente.', 3000, 'success');
  });

  // ============================================================
  // 🎓 Aprende Conmigo
  // ============================================================
  btnAprende.addEventListener('click', () => {
    mapContainer.style.display = 'none';
    learnPanel.style.display = 'flex';
  });

  btnVolverMapa?.addEventListener('click', () => {
    learnPanel.style.display = 'none';
    mapContainer.style.display = 'block';
  });

  // ============================================================
  // 📚 Visualización Dijkstra/Kruskal
  // ============================================================
  function obtenerTurnoActual() {
    const ruta = routeSelector.value;
    return ruta.includes('Matutina') ? 'Matutino' : 'Vespertino';
  }

  function mostrarAlgoritmo(tipo) {
    const turno = obtenerTurnoActual();
    learnBox.innerHTML = `
      <div class="algoritmo-panel">
        <h2>${tipo === 'dijkstra' ? 'Algoritmo de Dijkstra 🚍' : 'Algoritmo de Kruskal 🌳'}</h2>
        <div class="algoritmo-imagenes">
          <img src="assets/aprendeConmigo/${turno}/${tipo}/grafo.png" alt="Grafo del algoritmo">
          <img src="assets/aprendeConmigo/${turno}/${tipo}/${tipo === 'dijkstra' ? 'tabla' : 'matriz'}.png" alt="Tabla o matriz">
          <img src="assets/aprendeConmigo/${turno}/${tipo}/${tipo === 'dijkstra' ? 'ruta' : 'aristas'}.png" alt="Ruta u aristas">
        </div>
        <button class="btn-volver-menu" id="btnVolverMenu">⬅ Volver al menú</button>
      </div>
    `;

    document.getElementById('btnVolverMenu').addEventListener('click', () => {
      learnBox.innerHTML = `
        <img src="assets/icons/Maestra.png" alt="Maestra" class="icon-maestra-learn">
        <h2>Aprende Conmigo 🎓</h2>
        <p>Selecciona un algoritmo para visualizar:</p>
        <div class="learn-buttons">
          <button id="btnDijkstra" class="btn-orange">Algoritmo Dijkstra</button>
          <button id="btnKruskal" class="btn-orange">Algoritmo Kruskal</button>
          <button id="btnVolverMapa" class="btn-orange-outline">Volver al mapa</button>
        </div>
      `;
      document.getElementById('btnDijkstra').addEventListener('click', () => mostrarAlgoritmo('dijkstra'));
      document.getElementById('btnKruskal').addEventListener('click', () => mostrarAlgoritmo('kruskal'));
      document.getElementById('btnVolverMapa').addEventListener('click', () => {
        learnPanel.style.display = 'none';
        mapContainer.style.display = 'block';
      });
    });
  }

  document.getElementById('btnDijkstra').addEventListener('click', () => mostrarAlgoritmo('dijkstra'));
  document.getElementById('btnKruskal').addEventListener('click', () => mostrarAlgoritmo('kruskal'));
});
