// Array de categorías (fácil de modificar)
const categorias = [
  { value: 'anime', label: 'Anime' },
  { value: 'juegos', label: 'Juegos' },
  { value: 'películas', label: 'Películas' },
  { value: 'series', label: 'Series' },
  { value: 'tecnología', label: 'Tecnología' }
  // Agrega más categorías aquí, e.g., { value: 'música', label: 'Música' }
];

// Inicializar categorías en el formulario y navegación
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

  // Agregar eventos a los botones de categoría
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const categoria = btn.dataset.category;
      mostrarGrupos(categoria);
    });
  });
}

// Inicializar localStorage con grupos reales si está vacío
function inicializarGrupos() {
  const gruposIniciales = [
    {
      nombre: 'Fans de Anime',
      link: 'https://chat.whatsapp.com/DoPDjATFCDmHIMtvkEeYFS',
      categoria: 'anime',
      fecha: new Date().toISOString()
    },
    {
      nombre: 'Cine y Series',
      link: 'https://chat.whatsapp.com/LZxDKiBxU6ICxBRyr61Iv9',
      categoria: 'series',
      fecha: new Date().toISOString()
    }
  ];

  if (!localStorage.getItem('grupos')) {
    localStorage.setItem('grupos', JSON.stringify(gruposIniciales));
  }
}

// Alternar visibilidad del formulario
document.getElementById('toggleForm').addEventListener('click', () => {
  const formulario = document.getElementById('formulario');
  formulario.style.display = formulario.style.display === 'none' ? 'block' : 'none';
});

// Validar enlace de WhatsApp
function validarEnlaceWhatsApp(link) {
  const regex = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{22}$/;
  return regex.test(link);
}

// Manejo del formulario
document.getElementById('grupoForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value.trim();
  const link = document.getElementById('link').value.trim();
  const categoria = document.getElementById('categoria').value;

  // Mostrar mensaje de error si existe
  let errorMessage = document.getElementById('mensajeError');
  if (!errorMessage) {
    errorMessage = document.createElement('p');
    errorMessage.id = 'mensajeError';
    errorMessage.className = 'error-message';
    document.getElementById('grupoForm').after(errorMessage);
  }

  // Validación del enlace
  if (!validarEnlaceWhatsApp(link)) {
    errorMessage.textContent = 'Por favor, ingresa un enlace válido de WhatsApp.';
    errorMessage.style.display = 'block';
    return;
  } else {
    errorMessage.style.display = 'none';
  }

  const nuevoGrupo = {
    nombre,
    link,
    categoria,
    fecha: new Date().toISOString()
  };

  // Guardar en localStorage
  const grupos = JSON.parse(localStorage.getItem('grupos') || '[]');
  grupos.push(nuevoGrupo);
  localStorage.setItem('grupos', JSON.stringify(grupos));

  // Mostrar mensaje de éxito
  document.getElementById('grupoForm').reset();
  document.getElementById('mensajeExito').style.display = 'block';
  setTimeout(() => {
    document.getElementById('mensajeExito').style.display = 'none';
  }, 3000);

  // Actualizar la lista de grupos
  mostrarGrupos();

  // Ocultar el formulario tras enviar
  document.getElementById('formulario').style.display = 'none';
});

// Función para mostrar grupos
function mostrarGrupos(categoriaSeleccionada = 'todos') {
  const container = document.getElementById('group-container');
  const grupos = JSON.parse(localStorage.getItem('grupos') || '[]');

  container.innerHTML = '';

  const filtrados = categoriaSeleccionada === 'todos'
    ? grupos
    : grupos.filter(g => g.categoria === categoriaSeleccionada);

  if (filtrados.length === 0) {
    container.innerHTML = '<p>No hay grupos disponibles en esta categoría.</p>';
    return;
  }

  filtrados.forEach(g => {
    const card = document.createElement('div');
    card.className = 'group-card';
    card.innerHTML = `
      <h3>${g.nombre}</h3>
      <p><strong>Categoría:</strong> ${categorias.find(cat => cat.value === g.categoria)?.label || g.categoria}</p>
      <a href="${g.link}" target="_blank">Unirse al grupo</a>
    `;
    container.appendChild(card);
  });
}

// Inicializar al cargar la página
inicializarCategorias();
inicializarGrupos();
mostrarGrupos();
