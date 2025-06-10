// Configuración de Firebase (reemplaza con tus credenciales)
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Generar ID único para el usuario (basado en timestamp y aleatorio)
function generarOwnerId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Array de categorías
const categorias = [
  { value: 'anime', label: 'Anime', defaultDesc: '¡Únete para hablar sobre tus animes favoritos!' },
  { value: 'juegos', label: 'Juegos', defaultDesc: 'Grupo para gamers y discusiones sobre videojuegos.' },
  { value: 'películas', label: 'Películas', defaultDesc: 'Comparte y descubre películas de todos los géneros.' },
  { value: 'series', label: 'Series', defaultDesc: 'Hablamos de las mejores series y estrenos.' },
  { value: 'tecnología', label: 'Tecnología', defaultDesc: 'Discusiones sobre gadgets, software y más.' }
];

// Inicializar categorías
function inicializarCategorias() {
  const selectCategoria = document.getElementById('categoria');
  selectCategoria.innerHTML = '<option value="">-- Selecciona una categoría --</option>';
  categorias.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.value;
    option.textContent = cat.label;
    selectCategoria.appendChild(option);
  });

  const nav = document.querySelector('nav');
  nav.innerHTML = '<button class="category-btn" data-category="todos">Todos</button>';
  categorias.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'category-btn';
    btn.dataset.category = cat.value;
    btn.textContent = cat.label;
    nav.appendChild(btn);
  });

  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const categoria = btn.dataset.category;
      mostrarGrupos(categoria);
    });
  });
}

// Inicializar grupos en Firestore (vacío inicialmente)
async function inicializarGrupos() {
  const gruposSnapshot = await db.collection('grupos').get();
  if (!gruposSnapshot.empty) {
    mostrarGrupos();
  }
}

// Alternar visibilidad del formulario
document.getElementById('toggleForm').addEventListener('click', () => {
  const formulario = document.getElementById('formulario');
  console.log('Botón toggleForm clicado, display actual:', formulario.style.display);
  formulario.style.display = formulario.style.display === 'none' ? 'block' : 'none';
});

// Validar enlace de WhatsApp (solo grupos)
function validarEnlaceWhatsApp(link) {
  const regex = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{22}$/;
  return regex.test(link);
}

// Manejo del formulario
document.getElementById('grupoForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value.trim();
  const link = document.getElementById('link').value.trim();
  const descripcion = document.getElementById('descripcion').value.trim();
  const categoria = document.getElementById('categoria').value;
  const ownerId = generarOwnerId();

  const errorMessage = document.getElementById('mensajeError');
  if (!validarEnlaceWhatsApp(link)) {
    errorMessage.style.display = 'block';
    return;
  } else {
    errorMessage.style.display = 'none';
  }

  const defaultDesc = categorias.find(cat => cat.value === categoria)?.defaultDesc || 'Sin descripción.';
  const nuevoGrupo = {
    nombre,
    link,
    descripcion: descripcion || defaultDesc,
    categoria,
    fecha: new Date().toISOString(),
    ownerId,
    reportes: 0
  };

  // Guardar en Firestore
  const docRef = await db.collection('grupos').add(nuevoGrupo);

  // Mostrar mensaje de éxito con ID para borrado
  document.getElementById('grupoForm').reset();
  document.getElementById('mensajeExito').textContent = `✅ Grupo enviado correctamente. Tu ID para borrarlo: ${ownerId}`;
  document.getElementById('mensajeExito').style.display = 'block';
  setTimeout(() => {
    document.getElementById('mensajeExito').style.display = 'none';
    document.getElementById('mensajeExito').textContent = '✅ Grupo enviado correctamente.';
  }, 5000);

  // Actualizar la lista de grupos
  mostrarGrupos();

  // Ocultar el formulario
  document.getElementById('formulario').style.display = 'none';
});

// Mostrar grupos
async function mostrarGrupos(categoriaSeleccionada = 'todos') {
  const container = document.getElementById('group-container');
  container.innerHTML = '';

  const query = categoriaSeleccionada === 'todos'
    ? db.collection('grupos').orderBy('fecha', 'desc')
    : db.collection('grupos').where('categoria', '==', categoriaSeleccionada).orderBy('fecha', 'desc');

  const snapshot = await query.get();
  if (snapshot.empty) {
    container.innerHTML = '<p>No hay grupos disponibles en esta categoría.</p>';
    return;
  }

  snapshot.forEach(doc => {
    const g = doc.data();
    const card = document.createElement('div');
    card.className = 'group-card';
    card.innerHTML = `
      <h3>${g.nombre}</h3>
      <p><strong>Categoría:</strong> ${categorias.find(cat => cat.value === g.categoria)?.label || g.categoria}</p>
      <p>${g.descripcion}</p>
      <a href="${g.link}" target="_blank">Unirse</a>
      <div class="action-buttons">
        <button class="action-button report-btn" data-id="${doc.id}">Reportar</button>
        <button class="action-button delete-btn" data-id="${doc.id}" data-owner="${g.ownerId}">Borrar</button>
      </div>
    `;
    container.appendChild(card);
  });

  // Eventos para reportar y borrar
  document.querySelectorAll('.report-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const docId = btn.dataset.id;
      const docRef = db.collection('grupos').doc(docId);
      const doc = await docRef.get();
      const reportes = (doc.data().reportes || 0) + 1;

      if (reportes >= 5) {
        await docRef.delete();
      } else {
        await docRef.update({ reportes });
      }
      mostrarGrupos(categoriaSeleccionada);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const docId = btn.dataset.id;
      const ownerId = btn.dataset.owner;
      const userInput = prompt('Ingresa el ID de propietario para borrar este grupo:');
      if (userInput === ownerId) {
        await db.collection('grupos').doc(docId).delete();
        mostrarGrupos(categoriaSeleccionada);
      } else {
        alert('ID de propietario incorrecto.');
      }
    });
  });
}

// Inicializar al cargar la página
inicializarCategorias();
inicializarGrupos();
mostrarGrupos();
