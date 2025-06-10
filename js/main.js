// js/main.js

// 🔁 Datos falsos para pruebas iniciales
const grupos = [
  {
    nombre: "Grupo de Anime",
    link: "https://chat.whatsapp.com/anime123",
    descripcion: "Hablamos de Naruto, One Piece, etc.",
    categoria: "anime"
  },
  {
    nombre: "Cinéfilos Unidos",
    link: "https://chat.whatsapp.com/peliculas123",
    descripcion: "Discutimos estrenos y clásicos",
    categoria: "películas"
  }
];

function mostrarGrupos(filtro = "todos") {
  const contenedor = document.getElementById("group-container");
  contenedor.innerHTML = "";

  grupos.forEach(grupo => {
    if (filtro === "todos" || grupo.categoria === filtro) {
      const card = document.createElement("div");
      card.className = "group-card";
      card.innerHTML = `
        <h3>${grupo.nombre}</h3>
        <p>${grupo.descripcion}</p>
        <a href="${grupo.link}" target="_blank">Unirse</a>
      `;
      contenedor.appendChild(card);
    }
  });
}

// Cambiar categoría
document.querySelectorAll(".category-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const categoria = btn.dataset.category;
    mostrarGrupos(categoria);
  });
});

mostrarGrupos(); // mostrar todos al inicio
