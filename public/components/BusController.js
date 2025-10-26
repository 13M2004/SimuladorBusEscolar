// ============================================================
// 🚌 BusController.js — Control del bus en ruta (versión estable y sincronizada)
// ============================================================
// Colegio Genius Americano | Jutiapa
// Compatible con todos los roles (Tutora, Microbusero y Padre)
// ============================================================

import { MessageBoard } from './MessageBoard.js';

export class BusController {
  constructor(map, route, busIcon) {
    this.map = map;
    this.route = route;
    this.busIcon = busIcon;
    this.busMarker = null;
    this.currentIndex = 0;
    this.messageBoard = new MessageBoard('message-container');
    this.isPaused = false;
    this.isRunning = false;

    // 🚍 Velocidad uniforme para todos los roles
    this.speed = 130; // ms por paso
    this.steps = 25;  // pasos por tramo (más = más suave)
  }

  // ------------------------------------------------------------
  // 🟢 Iniciar recorrido
  // ------------------------------------------------------------
  async start() {
    if (!this.route || !this.route.length) {
      this.messageBoard.show("⚠️ No se ha cargado ninguna ruta.", 4000, "warning");
      return;
    }

    if (this.isRunning) {
      this.messageBoard.show("🚌 El recorrido ya está en curso.", 3000, "info");
      return;
    }

    this.isRunning = true;
    this.isPaused = false;
    this.currentIndex = 0;

    const startPos = this.route[0];
    const endPos = this.route[this.route.length - 1];

    // Crear o reiniciar marcador
    if (!this.busMarker) {
      this.busMarker = L.marker([startPos.lat, startPos.lng], { icon: this.busIcon }).addTo(this.map);
    } else {
      this.busMarker.setLatLng([startPos.lat, startPos.lng]);
    }

    this.map.setView([startPos.lat, startPos.lng], 15);
    this.messageBoard.show("👩‍🏫 ¡Nos preparamos para salir, estudiantes!", 4000, "info");

    await this.runSequentialMovement(endPos);
  }

  // ------------------------------------------------------------
  // 🔁 Movimiento secuencial (sin intervalos)
  // ------------------------------------------------------------
  async runSequentialMovement(endPos) {
    for (let i = 0; i < this.route.length - 1; i++) {
      if (!this.isRunning) break;

      const current = this.route[i];
      const next = this.route[i + 1];

      // Esperar si está pausado
      while (this.isPaused) await this.wait(200);

      // Moverse al siguiente punto
      await this.animateMovement(current, next);
      this.currentIndex = i + 1;

      this.messageBoard.show(`🚌 Llegamos a ${next.nombre}.`, 3000, "info");
      await this.wait(800); // pausa entre paradas
    }

    this.isRunning = false;
    this.messageBoard.show("🏫 ¡Hemos llegado al Colegio Genius Americano!", 5000, "success");
    this.map.setView([endPos.lat, endPos.lng], 16);
  }

  // ------------------------------------------------------------
  // ⏸️ Pausar recorrido
  // ------------------------------------------------------------
  pause() {
    if (!this.isRunning) {
      this.messageBoard.show("⚠️ No hay recorrido activo para pausar.", 2500, "warning");
      return;
    }

    if (this.isPaused) {
      this.messageBoard.show("⏸️ El recorrido ya está pausado.", 2500, "info");
      return;
    }

    this.isPaused = true;
    this.messageBoard.show("⏸️ Recorrido pausado temporalmente.", 3000, "warning");
  }

  // ------------------------------------------------------------
  // ▶️ Continuar recorrido
  // ------------------------------------------------------------
  continue() {
    if (!this.isRunning) {
      this.messageBoard.show("⚠️ No hay recorrido activo para continuar.", 2500, "warning");
      return;
    }

    if (!this.isPaused) {
      this.messageBoard.show("ℹ️ El recorrido ya está en marcha.", 2500, "info");
      return;
    }

    this.isPaused = false;
    this.messageBoard.show("▶️ Continuando recorrido...", 3000, "success");
  }

  // ------------------------------------------------------------
  // 🔄 Reiniciar recorrido
  // ------------------------------------------------------------
  reset() {
    this.isRunning = false;
    this.isPaused = false;
    this.currentIndex = 0;

    if (this.busMarker) {
      this.map.removeLayer(this.busMarker);
      this.busMarker = null;
    }

    this.messageBoard.show("🔄 Ruta reiniciada. Lista para comenzar de nuevo.", 3500, "success");
  }

  // ------------------------------------------------------------
  // 🚍 Animar movimiento entre dos puntos
  // ------------------------------------------------------------
  async animateMovement(start, end) {
    if (!end) return;
    const latStep = (end.lat - start.lat) / this.steps;
    const lngStep = (end.lng - start.lng) / this.steps;

    for (let i = 0; i <= this.steps; i++) {
      if (!this.isRunning) return;
      while (this.isPaused) await this.wait(200);

      const lat = start.lat + latStep * i;
      const lng = start.lng + lngStep * i;

      this.busMarker.setLatLng([lat, lng]);
      this.map.panTo([lat, lng], { animate: true, duration: 0.25 });

      await this.wait(this.speed);
    }
  }

  // ------------------------------------------------------------
  // ⏳ Espera
  // ------------------------------------------------------------
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
