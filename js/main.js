// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCuqZbnBvkLoTe3IvjAf7B7U7UaCY9Y2OY",
  authDomain: "whatsappgroups-13fa6.firebaseapp.com",
  projectId: "whatsappgroups-13fa6",
  storageBucket: "whatsappgroups-13fa6.firebasestorage.app",
  messagingSenderId: "773986686362",
  appId: "1:773986686362:web:3130e9e0c459d4a3039623",
  measurementId: "G-Y1R2WT3VV2"
};

// Inicializar Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log('Firebase inicializado correctamente');
} catch (error) {
  console.error('Error al inicializar Firebase:', error);
}
const db = firebase.firestore();

// Generar ID único para el usuario
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
  console.log('Inicializando categorías...');
  try {
    const selectCategoria = document.getElementById('categoria');
    if (!selectCategoria) {
      console.error('Elemento #categoria no encontrado');
      return;
    }
    selectCategoria.innerHTML = '<option value="">-- Selecciona una categoría --</option>';
    categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.value;
      option.textContent = cat.label;
      selectCategoria.appendChild(option);
    });
    console.log('Categorías añadidas al select:', categorias.map(cat => cat.label));

    const nav = document.querySelector('nav');
    if (!nav) {
      console.error('Elemento nav no encontrado');
      return;
    }
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
        console.log('Categoría seleccionada:', categoria);
        mostrarGrupos(categoria);
      });
    });
  } catch (error) {
    console.error('Error al inicializar categorías:', error);
  }
}

// Inicializar grupos
async function inicializarGrupos() {
  console.log('Inicializando grupos...');
  try {
    const gruposSnapshot = await db.collection('grupos').get();
    if (!gruposSnapshot.empty) {
      mostrarGrupos();
    } else {
      console.log('No hay grupos en Firestore');
    }
  } catch (error) {
    console.error('Error al inicializar grupos:', error);
  }
}

// Alternar visibilidad del formulario
function toggleFormulario() {
  console.log('Ejecutando toggleFormulario');
  const formulario = document.getElementById('formulario');
  if (!formulario) {
    console.error('Elemento #formulario no encontrado');
    return;
  }
  const isActive = formulario.classList.contains('active');
  console.log('Formulario activo:', isActive);
  formulario.classList.toggle('active');
}

// Añadir evento toggleForm
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM cargado');
  try {
    const toggleButton = document.getElementById('toggleForm');
    if (!toggleButton) {
      console.error('Elemento #toggleForm no encontrado');
      return;
    }
    toggleButton.addEventListener('click', toggleFormulario);
    console.log('Evento toggleForm añadido');
  } catch (error) {
    console.error('Error al añadir evento toggleForm:', error);
  }
});

// Validar enlace de WhatsApp (solo grupos)
function validateWhatsAppLink(link) {
  const regex = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{22}$/;
  return regex.test(link);
}

// Manejo del formulario
document.addEventListener('DOMContentLoaded', () => {
  try {
    const grupoForm = document.getElementById('grupoForm');
    if (!grupoForm) {
      console.error('Elemento #grupoForm no encontrado');
      return;
    }
    grupoForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      console.log('Formulario enviado');

      const nombre = document.getElementById('nombre').value.trim();
      const link = document.getElementById('link').value.trim();
      const descripcion = document.getElementById('descripcion').value.trim();
      const categoria = document.getElementById('categoria').value;
      const ownerId = generarOwnerId();

      const errorMessage = document.getElementById('mensajeError');
      if (!validateWhatsAppLink(link)) {
        errorMessage.textContent = 'Por favor, ingresa un enlace válido de WhatsApp.';
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

      try {
        const docRef = await db.collection('grupos').add(nuevoGrupo);
        console.log('Grupo guardado con ID:', docRef.id);

        document.getElementById('grupoForm').reset();
        document.getElementById('mensajeExito').textContent = `✅ Grupo enviado correctamente. Tu ID para borrarlo: ${ownerId}`;
        document.getElementById('mensajeExito').style.display = 'block';
        setTimeout(() => {
          document.getElementById('mensajeExito').style.display = 'none';
          document.getElementById('mensajeExito').textContent = '✅ Grupo enviado correctamente.';
        }, 5000);

        mostrarGrupos();
        document.getElementById('formulario').classList.remove('active');
      } catch (error) {
        console.error('Error al guardar grupo:', error);
        errorMessage.textContent = 'Error al guardar el grupo. Intenta de nuevo.';
        errorMessage.style.display = 'block';
      }
    });
  } catch (error) {
    console.error('Error al añadir evento grupoForm:', error);
  }

  // Inicializar categorías y grupos
  try {
    inicializarCategorias();
    inicializarGrupos();
    mostrarGrupos();
  } catch (error) {
    console.error('Error al inicializar página:', error);
  }
});

// Mostrar grupos
async function mostrarGrupos(categoriaSeleccionada = 'todos') {
  console.log('Mostrando grupos, categoría:', categoriaSeleccionada);
  const container = document.getElementById('group-container');
  if (!container) {
    console.error('Elemento #group-container no encontrado');
    return;
  }
  container.innerHTML = '';

  try {
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
          <button class="action-button" data-action="delete" data-id="${doc.id}" data-owner="${g.ownerId}">Eliminar</button>
        </div>
      `;
      container.appendChild(card);
    });

    // Eventos para reportar
    document.querySelectorAll('.report-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const docId = btn.dataset.id;
        const docRef = db.collection('grupos').doc(docId);
        try {
          const doc = await docRef.get();
          if (!doc.exists) return;
          const reportes = (doc.data().reportes || 0) + 1;

          if (reportes >= 6) {
            await docRef.delete();
            console.log('Grupo eliminado por reportes:', docId);
          } else {
            await docRef.update({ reportes });
            console.log('Reporte añadido, total:', reportes);
          }
          mostrarGrupos(categoriaSeleccionada);
        } catch (error) {
          console.error('Error al reportar grupo:', error);
        }
      });
    });

    // Eventos para borrar
    document.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const docId = btn.dataset.id;
        const ownerId = btn.dataset.owner;
        const userInput = prompt('Ingresa el ID de propietario para borrar este grupo:');
        if (userInput === ownerId) {
          try {
            await db.collection('grupos').doc(docId).delete();
            console.log('Grupo eliminado por propietario:', docId);
            mostrarGrupos(categoriaSeleccionada);
          } catch (error) {
            console.error('Error al borrar grupo:', error);
            alert('Error al borrar el grupo.');
          }
        } else {
          alert('ID de propietario incorrecto.');
        }
      });
    });
  } catch (error) {
    console.error('Error al mostrar grupos:', error);
    container.innerHTML = '<p>Error al cargar grupos. Intenta recargar la página.</p>';
  }
}
