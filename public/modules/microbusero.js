// ============================================================
// 🚍 Microbusero.js — Panel del Conductor
// Proyecto: Simulador de Ruta Escolar | Colegio Genius Americano
// ============================================================

import { MessageBoard } from '../components/MessageBoard.js';
import { BusController } from '../components/BusController.js';

document.addEventListener('DOMContentLoaded', async () => {
  // ============================================================
  // 📦 Referencias del DOM
  // ============================================================
  const messageBoard = new MessageBoard('message-container');
  const routeSelector = document.getElementById('routeSelector');
  const logoutBtn = document.getElementById('logout');
  const userInfo = document.getElementById('user-info');
  const paradasList = document.getElementById('paradas-list');
  const btnStart = document.getElementById('btnStart');
  const btnPause = document.getElementById('btnPause');
  const btnContinue = document.getElementById('btnContinue');
  const distanciaEl = document.getElementById('distancia');
  const proximaEl = document.getElementById('proxima');

  // ============================================================
  // 🧑‍✈️ Sesión activa
  // ============================================================
  const session = JSON.parse(localStorage.getItem('session'));
  if (session && session.name) {
    userInfo.textContent = `🚌 ${session.name}`;
  } else {
    window.location.href = 'index.html';
    return;
  }

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('session');
    window.location.href = 'index.html';
  });

  // ============================================================
  // 🗺️ Inicializar mapa Leaflet
  // ============================================================
  const map = L.map('map').setView([14.2919, -89.8960], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  // Iconos personalizados
  const iconBus = L.icon({ iconUrl: 'assets/icons/BusEscolar.png', iconSize: [42, 42] });
  const iconColegio = L.icon({ iconUrl: 'assets/icons/Colegio.png', iconSize: [38, 38] });
  const iconGasolinera = L.icon({ iconUrl: 'assets/icons/Gasolinera.png', iconSize: [34, 34] });
  const iconParada = L.icon({ iconUrl: 'assets/icons/Paradas.png', iconSize: [28, 28] });

  // ============================================================
  // 📘 Variables globales
  // ============================================================
  let rutaData = null;
  let bus = null;

  // ============================================================
  // 📘 Cargar ruta seleccionada
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

      // Reiniciar lista de paradas
      paradasList.innerHTML = '';

      const liInicio = document.createElement('li');
      liInicio.textContent = `⛽ Gasolinera Papigaso (Inicio)`;
      paradasList.appendChild(liInicio);

      rutaData.route.forEach((p, i) => {
        if (i > 0 && i < rutaData.route.length - 1) {
          const li = document.createElement('li');
          li.textContent = `${p.nombre}`;
          paradasList.appendChild(li);
        }
      });

      const liFin = document.createElement('li');
      liFin.textContent = `🏫 Colegio Genius Americano (Final)`;
      paradasList.appendChild(liFin);

      // Limpiar mapa anterior
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) map.removeLayer(layer);
      });

      // Dibujar ruta
      const coords = rutaData.route.map(p => [p.lat, p.lng]);
      L.polyline(coords, { color: '#1a5d1a', weight: 4 }).addTo(map);
      map.fitBounds(coords);

      // Marcadores
      L.marker(coords[0], { icon: iconGasolinera }).addTo(map).bindPopup('⛽ Inicio - Gasolinera Papigaso');
      L.marker(coords[coords.length - 1], { icon: iconColegio }).addTo(map).bindPopup('🏫 Colegio Genius Americano');

      rutaData.route.forEach((p, i) => {
        if (i > 0 && i < rutaData.route.length - 1) {
          const offset = 0.00025 * (i % 2 === 0 ? 1 : -1);
          L.marker([p.lat + offset, p.lng + offset], { icon: iconParada })
            .addTo(map)
            .bindPopup(`🧍 Parada ${i}: ${p.nombre}`);
        }
      });

      bus = null;
      resetIndicators();
      messageBoard.show(`✅ ${rutaData.nombreRuta} cargada (${rutaData.horario})`, 4000, 'success');
    } catch (err) {
      console.error(err);
      messageBoard.show('⚠️ No se pudo cargar la ruta.', 4000, 'error');
    }
  }

  // ============================================================
  // ▶️ Controles del recorrido (Botones)
  // ============================================================
  btnStart.addEventListener('click', async () => {
    if (!rutaData) {
      messageBoard.show('⚠️ Primero selecciona una ruta.', 4000, 'warning');
      return;
    }

    if (!bus) bus = new BusController(map, rutaData.route, iconBus);
    await bus.start();

    messageBoard.show('▶️ Recorrido iniciado correctamente.', 3000, 'success');
  });

  btnPause.addEventListener('click', () => {
    if (!bus) return;
    bus.pause();
    messageBoard.show('⏸️ Recorrido pausado temporalmente.', 3000, 'info');
  });

  btnContinue.addEventListener('click', () => {
    if (!bus) return;
    bus.continue();
    messageBoard.show('▶️ Recorrido reanudado.', 3000, 'success');
  });

  // ============================================================
  // 📍 Actualización automática de indicadores
  // ============================================================
  function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  }

  function resetIndicators() {
    distanciaEl.textContent = '0 km';
    proximaEl.textContent = '—';
  }

  function actualizarIndicadores() {
    if (!bus || !rutaData?.route || bus.currentIndex >= rutaData.route.length - 1) return;
    const actual = rutaData.route[bus.currentIndex];
    const siguiente = rutaData.route[bus.currentIndex + 1];
    if (!actual || !siguiente) return;
    const dist = calcularDistancia(actual.lat, actual.lng, siguiente.lat, siguiente.lng);
    distanciaEl.textContent = `${dist} km`;
    proximaEl.textContent = siguiente.nombre;
  }

  setInterval(actualizarIndicadores, 2000);
});
