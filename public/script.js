// =============================================================
// 🚍 SCRIPT PRINCIPAL – Simulador de Ruta Escolar Genius Americano
// Coordina los módulos según el rol del usuario logueado
// =============================================================

// === IMPORTAR COMPONENTES ===
import { MapManager } from './components/MapManager.js';
import { BusController } from './components/BusController.js';
import { MessageBoard } from './components/MessageBoard.js';

// === IMPORTAR MÓDULOS SEGÚN ROLES ===
import { initMicrobusero } from './modules/microbusero.js';
import { initPadre } from './modules/padre.js';
import { initTutora } from './modules/tutora.js';

// =============================================================
// 🌎 INICIALIZACIÓN GLOBAL
// =============================================================

document.addEventListener("DOMContentLoaded", async () => {
  // === 1️⃣ Verificar sesión ===
  const session = JSON.parse(localStorage.getItem("session"));
  if (!session) {
    alert("⚠️ No has iniciado sesión.");
    window.location.href = "index.html";
    return;
  }

  const { email, role, name } = session;
  console.log(`🧭 Usuario logueado: ${name} (${role})`);

  // === 2️⃣ Mostrar información del usuario ===
  const userInfo = document.getElementById("user-info");
  if (userInfo) userInfo.textContent = `${name} · ${role}`;

  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("session");
      window.location.href = "index.html";
    });
  }

  // === 3️⃣ Crear el mapa (Leaflet) ===
  const mapElement = document.getElementById("map");
  if (!mapElement) {
    console.error("❌ No se encontró el elemento del mapa.");
    return;
  }

  const mapManager = new MapManager("map");
  await mapManager.initMap();

  // === 4️⃣ Crear los componentes base ===
  const busController = new BusController(mapManager);
  const messageBoard = new MessageBoard(document.getElementById("message-board"));

  // === 5️⃣ Cargar la ruta base ===
  const routeData = await loadJSON('./routes/dataRuta1Matutina.json');
  if (routeData) {
    mapManager.loadRoute(routeData);
  }

  // === 6️⃣ Ejecutar módulo según el rol ===
  switch (role.toLowerCase()) {
    case "microbusero":
      initMicrobusero(mapManager, busController, messageBoard);
      break;

    case "padre":
    case "niño":
      initPadre(mapManager, busController, messageBoard);
      break;

    case "tutora":
      initTutora(mapManager, busController, messageBoard);
      break;

    default:
      alert("Rol desconocido. Contacta con el administrador.");
      break;
  }

  console.log("✅ Simulador inicializado correctamente.");
});

// =============================================================
// 📄 FUNCIÓN AUXILIAR PARA CARGAR ARCHIVOS JSON
// =============================================================
async function loadJSON(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Error al cargar ${path}`);
    return await response.json();
  } catch (err) {
    console.error("❌ Error al cargar JSON:", err);
    return null;
  }
}
