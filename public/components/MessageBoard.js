// ============================================================
// 💬 MessageBoard.js — Sistema de mensajes de la maestra
// ============================================================
// Colegio Genius Americano | Jutiapa
// Compatible con todos los roles (Tutora, Microbusero, Padre)
// ============================================================

export class MessageBoard {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.queue = [];          // Cola de mensajes pendientes
    this.isShowing = false;   // Controla si hay un mensaje activo
  }

  // ------------------------------------------------------------
  // 🗨️ Mostrar un mensaje con duración y tipo personalizados
  // ------------------------------------------------------------
  show(message, duration = 4000, type = 'info') {
    if (!this.container) return;

    // Añadir mensaje a la cola
    this.queue.push({ message, duration, type });
    if (!this.isShowing) this._displayNext();
  }

  // ------------------------------------------------------------
  // ⏭️ Mostrar el siguiente mensaje en cola
  // ------------------------------------------------------------
  _displayNext() {
    if (this.queue.length === 0) {
      this.isShowing = false;
      return;
    }

    this.isShowing = true;
    const { message, duration, type } = this.queue.shift();

    // Asignar clases CSS dinámicas según el tipo
    this.container.className = `message-box message-${type}`;
    this.container.innerText = message;
    this.container.style.display = 'block';
    this.container.style.opacity = '1';

    // Ocultar después del tiempo definido
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.hide(), duration);
  }

  // ------------------------------------------------------------
  // 🚫 Ocultar mensaje actual y continuar con el siguiente
  // ------------------------------------------------------------
  hide() {
    if (!this.container) return;

    this.container.style.opacity = '0';
    setTimeout(() => {
      this.container.style.display = 'none';
      this._displayNext(); // Mostrar siguiente en cola
    }, 400);
  }

  // ------------------------------------------------------------
  // 🧹 Limpiar todos los mensajes pendientes
  // ------------------------------------------------------------
  clear() {
    this.queue = [];
    clearTimeout(this.timeout);
    this.isShowing = false;
    if (this.container) {
      this.container.style.display = 'none';
      this.container.className = 'message-box';
    }
  }
}
