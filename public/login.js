// ============================================================
// 🔐 login.js — Gestión de autenticación y roles
// Proyecto: Simulador de Bus Escolar | Colegio Genius Americano
// ============================================================

// ============================================================
// 🧹 LIMPIEZA AUTOMÁTICA DE SESIÓN AL CARGAR LOGIN
// ============================================================
// Cada vez que se abra el login, se elimina cualquier sesión previa.
window.addEventListener('load', () => {
  localStorage.removeItem('session');
  console.log('🧹 Sesión anterior eliminada. Iniciando desde cero.');
});

// ============================================================
// 📂 FUNCIÓN DE LOGIN SIMULADO
// ============================================================
// Simula la autenticación de usuarios utilizando un archivo local JSON.
// Posteriormente se podrá reemplazar por Firebase Authentication.
async function mockLogin(email, password, role) {
  try {
    // Carga del archivo local de usuarios (data/users.json)
    const res = await fetch('data/users.json');
    const users = await res.json();

    // Búsqueda del usuario con coincidencia exacta de email, contraseña y rol
    const user = users.find(
      (u) =>
        u.email === email &&
        u.password === password &&
        u.role.toLowerCase() === role.toLowerCase()
    );

    // Si no existe, mostramos error
    if (!user) throw new Error('❌ Credenciales inválidas o rol incorrecto.');

    // Guardar sesión local para mantener al usuario autenticado
    localStorage.setItem(
      'session',
      JSON.stringify({ email, role, name: user.name })
    );

    console.log(`✅ Sesión iniciada: ${user.name} (${role})`);

    // Redirigir al dashboard correspondiente
    redirectByRole(role);
  } catch (err) {
    console.error('Error en autenticación:', err);
    alert(err.message);
  }
}

// ============================================================
// 🚦 REDIRECCIÓN SEGÚN ROL
// ============================================================
// Envía al usuario a su respectiva interfaz dependiendo del rol.
function redirectByRole(role) {
  switch (role.toLowerCase()) {
    case 'tutora':
      window.location.href = 'dashboard_tutora.html';
      break;

    case 'microbusero':
      window.location.href = 'dashboard_microbusero.html';
      break;

    case 'padre':
    case 'nino': // compatibilidad con versiones anteriores
      window.location.href = 'dashboard_padre.html';
      break;

    default:
      alert('⚠️ Rol no reconocido. Contacta al administrador.');
  }
}

// ============================================================
// 📥 LISTENER DEL FORMULARIO DE LOGIN
// ============================================================
// Captura el evento del formulario y ejecuta la función mockLogin.
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Obtener datos del formulario
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const role = document.getElementById('role').value;

  // Validaciones básicas
  if (!email || !password) {
    alert('Por favor ingresa tu correo y contraseña.');
    return;
  }

  // Ejecutar login simulado
  await mockLogin(email, password, role);
});

// ============================================================
// 🚪 FUNCIÓN DE LOGOUT (USADA EN TODOS LOS ROLES)
// ============================================================
// Elimina la sesión y regresa al login principal.
export function logout() {
  localStorage.removeItem('session');
  window.location.href = 'index.html';
}
