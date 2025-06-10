// Alternar visibilidad del formulario
document.getElementById('toggleForm').addEventListener('click', () => {
  const formulario = document.getElementById('formulario');
  formulario.style.display = formulario.style.display === 'none' ? 'block' : 'none';
});

// Manejo del formulario
document.getElementById('grupoForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value.trim();
  const link = document.getElementById('link').value.trim();
  const categoria = document.getElementById('categoria').value;

  // Validación simple del link
  if (!link.startsWith('https://chat.whatsapp.com/')) {
    alert('Solo se permiten enlaces de grupos de WhatsApp.');
    return;
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
      <p><strong>Categoría:</strong> ${g.categoria}</p>
      <a href="${g.link}" target="_blank">Unirse al grupo</a>
    `;
    container.appendChild(card);
  });
}

// Cambiar por categoría
document.querySelectorAll('.category-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const categoria = btn.dataset.category;
    mostrarGrupos(categoria);
  });
});

// Mostrar todos al cargar
mostrarGrupos();
