// ============================================================
// 🗺️ MapManager.js — Carga de mapa y marcadores base
// ============================================================

export class MapManager {
  constructor(map) {
    this.map = map;
  }

  cargarMarcadoresBase() {
    const lugares = [
      { nombre: "Colegio Genius Americano", lat: 14.2896, lng: -89.92523, icon: "Colegio.png" },
      { nombre: "Gasolinera", lat: 14.291, lng: -89.918, icon: "Gasolinera.png" },
      { nombre: "Maestra", lat: 14.2905, lng: -89.922, icon: "Maestra.png" }
    ];

    lugares.forEach(l => {
      const icon = L.icon({
        iconUrl: `assets/icons/${l.icon}`,
        iconSize: [36, 36]
      });
      L.marker([l.lat, l.lng], { icon }).addTo(this.map).bindPopup(l.nombre);
    });
  }
}
