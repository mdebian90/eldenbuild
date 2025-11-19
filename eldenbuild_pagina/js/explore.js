(async function () {

  adjustNav();
  const ok = await requireAuth();
  if (!ok) return;

  const GridExplorar = document.querySelector("#GridExplorar");
  const plantilla = document.querySelector(".TarjetaBuild");
  const Buscar = document.querySelector("#Buscar");

  if (!GridExplorar || !plantilla) return;

  plantilla.style.display = "none";

  let datos = [];
  try {
    const r = await fetch(API + "/obtener_builds_explore");
    if (r.status !== 200) {
      GridExplorar.innerHTML =
        "<div style='padding:16px'>No se pudieron cargar las builds (" +
        r.status +
        ").</div>";
      return;
    }
    const json = await r.json();
    datos = json.builds || [];
  } catch (e) {
    GridExplorar.innerHTML =
      "<div style='padding:16px'>Error de red al cargar builds.</div>";
    return;
  }

  if (datos.length === 0) {
    GridExplorar.innerHTML =
      "<div style='padding:16px'>No hay builds públicas por ahora.</div>";
    return;
  }

  for (let i = 0; i < datos.length; i++) {
    const b = datos[i];
    const clon = plantilla.cloneNode(true);
    clon.style.display = "block";
    clon.dataset.buildId = b.id;
    GridExplorar.appendChild(clon);

    clon.querySelector(".NombreBuild").textContent = b.titulo;

    clon.querySelector(".NumeroLikes").textContent = b.likes;

    const ImagenBuild = clon.querySelector(".ImagenBuild");
    try {
      const rr = await fetch(API + "/obtener_imagen_build_" + b.id);
      if (rr.status === 200) {
        const blob = await rr.blob();
        const url = URL.createObjectURL(blob);
        ImagenBuild.style.backgroundImage = "url('" + url + "')";
        ImagenBuild.style.backgroundSize = "cover";
        ImagenBuild.style.backgroundPosition = "center";
      } else {
        ImagenBuild.style.background = "#d9d9d9";
        ImagenBuild.style.backgroundImage = "";
      }
    } catch {
      ImagenBuild.style.background = "#d9d9d9";
      ImagenBuild.style.backgroundImage = "";
    }

    clon.addEventListener("click", function () {
      const idSeleccionado = Number(clon.dataset.buildId);
      localStorage.setItem("build_view", idSeleccionado);

      let recientes =
        JSON.parse(localStorage.getItem("recientes_builds") || "[]") || [];
      if (!recientes.includes(idSeleccionado)) {
        recientes.unshift(idSeleccionado);
        if (recientes.length > 5) recientes = recientes.slice(0, 5);
        localStorage.setItem("recientes_builds", JSON.stringify(recientes));
      }

      window.location.href = "viewer.html?id=" + idSeleccionado;
    });
  }

  Buscar.addEventListener("input", function () {
    const texto = Buscar.value.toLowerCase();
    const tarjetas = GridExplorar.querySelectorAll(".TarjetaBuild");
    for (let indice = 0; indice < tarjetas.length; indice++) {
      if (tarjetas[indice] === plantilla) continue;
      const nombre = tarjetas[indice]
        .querySelector(".NombreBuild")
        .textContent.toLowerCase();
      tarjetas[indice].style.display = nombre.includes(texto) ? "block" : "none";
    }
  });
})();
