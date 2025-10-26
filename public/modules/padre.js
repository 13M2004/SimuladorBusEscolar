// ============================================================
// 👨‍👩‍👧 Padre.js — Panel del Padre de Familia
// Proyecto: Simulador de Ruta Escolar | Colegio Genius Americano
// ============================================================

import { MessageBoard } from '../components/MessageBoard.js';
import { BusControllerPadre } from '../components/BusControllerPadre.js';

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
  const estadoActual = document.getElementById('estadoActual');
  const tiempoRestante = document.getElementById('tiempoRestante');

  // ============================================================
  // 🧑‍👨‍👧 Sesión activa
  // ============================================================
  const session = JSON.parse(localStorage.getItem('session'));
  if (session && session.name) {
    userInfo.textContent = `👨‍👩‍👧 ${session.name}`;
  } else {
    window.location.href = 'index.html';
    return;
  }

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('session');
    window.location.href = 'index.html';
  });

  // ============================================================
  // 🗺️ Inicializar mapa
  // ============================================================
  const map = L.map('map').setView([14.2919, -89.8960], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  // 🔹 Iconos personalizados
  const iconBus = L.icon({ iconUrl: 'assets/icons/BusEscolar.png', iconSize: [42, 42] });
  const iconColegio = L.icon({ iconUrl: 'assets/icons/Colegio.png', iconSize: [38, 38] });
  const iconGasolinera = L.icon({ iconUrl: 'assets/icons/Gasolinera.png', iconSize: [34, 34] });
  const iconParada = L.icon({ iconUrl: 'assets/icons/Paradas.png', iconSize: [28, 28] });

  // Variables globales
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
        if (i === 0 || i === rutaData.route.length - 1) return;
        const li = document.createElement('li');
        li.textContent = `${p.nombre}`;
        paradasList.appendChild(li);
      });

      const liFin = document.createElement('li');
      liFin.textContent = `🏫 Colegio Genius Americano (Final)`;
      paradasList.appendChild(liFin);

      // Limpiar mapa anterior
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) map.removeLayer(layer);
      });

      // Dibujar la ruta
      const coords = rutaData.route.map(p => [p.lat, p.lng]);
      L.polyline(coords, { color: '#00695c', weight: 4 }).addTo(map);
      map.fitBounds(coords);

      // Marcadores principales
      L.marker(coords[0], { icon: iconGasolinera }).addTo(map).bindPopup('⛽ Gasolinera Papigaso (Inicio)');
      L.marker(coords[coords.length - 1], { icon: iconColegio }).addTo(map).bindPopup('🏫 Colegio Genius Americano (Final)');

      // Marcadores intermedios
      rutaData.route.forEach((p, i) => {
        if (i > 0 && i < rutaData.route.length - 1) {
          const offset = 0.00025 * (i % 2 === 0 ? 1 : -1);
          L.marker([p.lat + offset, p.lng + offset], { icon: iconParada })
            .addTo(map)
            .bindPopup(`🧍 Parada ${i}: ${p.nombre}`);
        }
      });

      // Reiniciar
      bus = null;
      messageBoard.show(`✅ ${rutaData.nombreRuta} cargada (${rutaData.horario})`, 4000, 'success');
    } catch (err) {
      console.error(err);
      messageBoard.show('⚠️ No se pudo cargar la ruta.', 4000, 'error');
    }
  }

  // ============================================================
  // ▶️ Iniciar recorrido
  // ============================================================
  btnStart.addEventListener('click', async () => {
    if (!rutaData) {
      messageBoard.show('⚠️ Primero selecciona una ruta.', 4000, 'warning');
      return;
    }

    // 🔹 Definir parada del hijo según la ruta seleccionada
    // (Índice dentro del arreglo route[])
    let paradaHijo;
    if (routeSelector.value.includes('Matutina')) {
      paradaHijo = 8; // Alumno 8 en Ruta Matutina
    } else if (routeSelector.value.includes('Vespertina')) {
      paradaHijo = 3; // Alumno 3 en Ruta Vespertina
    } else {
      paradaHijo = 5; // Valor por defecto
    }

    // Crear controlador del bus con la parada del hijo
    if (!bus) bus = new BusControllerPadre(map, rutaData.route, iconBus, paradaHijo);

    await bus.start();
    messageBoard.show('🚍 Recorrido iniciado correctamente.', 3000, 'success');
  });
});
