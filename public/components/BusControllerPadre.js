// ============================================================
// 🚌 BusControllerPadre.js — Control del bus para el rol de Padre
// ============================================================
// Extiende la clase base BusController.js y adapta la vista
// para observación del recorrido y notificación de la parada del hijo.
// ============================================================

import { BusController } from './BusController.js';
import { MessageBoard } from './MessageBoard.js';

export class BusControllerPadre extends BusController {
  constructor(map, route, busIcon, paradaHijo) {
    super(map, route, busIcon);

    // ------------------------------------------------------------
    // 🔍 Propiedades específicas del rol Padre
    // ------------------------------------------------------------
    this.paradaHijo = paradaHijo; // índice donde vive el hijo
    this.messageBoard = new MessageBoard('message-container');
    this.currentStopElement = document.getElementById('estadoActual');
    this.timeLeftElement = document.getElementById('tiempoRestante');
    this.startTime = null;
    this.hijoNotificado = false; // evita mensaje duplicado
  }

  // ------------------------------------------------------------
  // 🟢 Iniciar recorrido (modo observador)
  // ------------------------------------------------------------
  async start() {
    if (!this.route || !this.route.length) {
      this.messageBoard.show("⚠️ No se ha cargado ninguna ruta.", 4000, "warning");
      return;
    }

    this.isRunning = true;
    this.isPaused = false;
    this.currentIndex = 0;
    this.startTime = Date.now();

    const startPos = this.route[0];

    // Crear marcador del bus si no existe
    if (!this.busMarker) {
      this.busMarker = L.marker([startPos.lat, startPos.lng], { icon: this.busIcon }).addTo(this.map);
    } else {
      this.busMarker.setLatLng([startPos.lat, startPos.lng]);
    }

    // Centrar vista inicial
    this.map.setView([startPos.lat, startPos.lng], 15);
    this.messageBoard.show("👨‍👩‍👧 El bus ha salido de la Gasolinera Papigaso.", 4000, "info");
    this.updateUI("Inicio del recorrido", "Calculando...");

    // ------------------------------------------------------------
    // 🚌 Recorrido paso a paso
    // ------------------------------------------------------------
    for (let i = 0; i < this.route.length; i++) {
      if (this.isPaused || !this.isRunning) return;

      const currentStop = this.route[i];
      const nextStop = this.route[i + 1];

      // Actualizar interfaz y mostrar parada actual
      this.updateUI(currentStop.nombre, this.getTimeEstimate(i));
      this.messageBoard.show(`🚌 El bus está en ${currentStop.nombre}.`, 4000, "info");

      // Movimiento animado sin recentrar cada paso (usa la base optimizada)
      await this.animateMovement(currentStop, nextStop);

      // Centrar mapa solo cuando llega a una parada
      if (nextStop) this.map.setView([nextStop.lat, nextStop.lng], 16);

      // Notificación de abordaje (solo una vez)
      if (i === this.paradaHijo && !this.hijoNotificado) {
        this.messageBoard.show("👋 Su hijo está abordando el bus.", 5000, "success");
        this.hijoNotificado = true;
      }

      // Pausa breve antes de continuar al siguiente punto
      await this.wait(2500);
    }

    // ------------------------------------------------------------
    // 🏫 Llegada al colegio
    // ------------------------------------------------------------
    this.messageBoard.show("🏫 ¡El bus ha llegado al Colegio Genius Americano!", 5000, "success");
    this.updateUI("Colegio Genius Americano", "Recorrido finalizado");
    this.isRunning = false;
  }

  // ------------------------------------------------------------
  // 🟡 Actualiza los datos visibles en la interfaz del Padre
  // ------------------------------------------------------------
  updateUI(currentStop, timeLeft) {
    if (this.currentStopElement)
      this.currentStopElement.textContent = `🚏 ${currentStop}`;
    if (this.timeLeftElement)
      this.timeLeftElement.textContent = `⏳ ${timeLeft}`;
  }

  // ------------------------------------------------------------
  // ⏳ Cálculo del tiempo estimado restante
  // ------------------------------------------------------------
  getTimeEstimate(index) {
    const remainingStops = this.route.length - index - 1;
    const avgPerStop = 0.8; // minutos promedio entre paradas (ajustable)
    return `${(remainingStops * avgPerStop).toFixed(1)} min`;
  }
}
