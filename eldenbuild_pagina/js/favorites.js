(async function () {
  adjustNav();
  const ok = await requireAuth();
  if (!ok) return;

  const GridFavs = document.querySelector("#GridFavs");
  const plantillaFav = document.querySelector(".TarjetaFav");

  const ListaRecientes = document.querySelector("#ListaRecientes");
  const plantillaReciente = document.querySelector(".Reciente");

  const NombreUsuario = document.querySelector("#NombreUsuario");
  const FotoUsuario = document.querySelector("#Avatar");

  if (plantillaFav) plantillaFav.style.display = "none";
  if (plantillaReciente) plantillaReciente.style.display = "none";

  const me = await getUsuarioActual();
  if (!me) { window.location.href = "sign_in.html"; return; }
  const id_usuario = Number(me.id);

  const inicial = (me.nombre && me.nombre.trim().length > 0) ? (me.nombre.trim().charAt(0) + ".") : "";
  const primerApellido = (me.apellido && me.apellido.trim().length > 0) ? me.apellido.trim().split(" ")[0] : "";
  if (NombreUsuario) NombreUsuario.textContent = (inicial + " " + primerApellido).trim() || "User";

  try {
    const rFoto = await fetch(API + "/obtener_imagen_usuario_" + id_usuario);
    if (rFoto.status === 200) {
      const blob = await rFoto.blob();
      const url = URL.createObjectURL(blob);
      if (FotoUsuario && FotoUsuario.tagName && FotoUsuario.tagName.toLowerCase() === "img") {
        FotoUsuario.src = url;
      } else if (FotoUsuario) {
        FotoUsuario.style.backgroundImage = "url('" + url + "')";
        FotoUsuario.style.backgroundSize = "cover";
        FotoUsuario.style.backgroundPosition = "center";
      }
    } else {
      const def = "img/default.png";
      if (FotoUsuario && FotoUsuario.tagName && FotoUsuario.tagName.toLowerCase() === "img") {
        FotoUsuario.src = def;
      } else if (FotoUsuario) {
        FotoUsuario.style.backgroundImage = "url('" + def + "')";
        FotoUsuario.style.backgroundSize = "cover";
        FotoUsuario.style.backgroundPosition = "center";
      }
    }
  } catch {
    const def = "img/default.png";
    if (FotoUsuario && FotoUsuario.tagName && FotoUsuario.tagName.toLowerCase() === "img") {
      FotoUsuario.src = def;
    } else if (FotoUsuario) {
      FotoUsuario.style.backgroundImage = "url('" + def + "')";
      FotoUsuario.style.backgroundSize = "cover";
      FotoUsuario.style.backgroundPosition = "center";
    }
  }

  try {
    const rf = await fetch(API + "/obtener_favoritos_" + id_usuario);
    if (rf.status !== 200) {
      if (GridFavs) GridFavs.innerHTML = "<div style='padding:16px'>Error while loading favorites</div>";
    } else {
      const favs = (await rf.json()).builds || [];
      if (favs.length === 0) {
        if (GridFavs) GridFavs.innerHTML = "<div style='padding:16px'>You have no favorites yet</div>";
      } else {
        for (let i = 0; i < favs.length; i++) {
          const b = favs[i];
          const clon = plantillaFav.cloneNode(true);
          clon.style.display = "block";
          clon.dataset.buildId = b.id;
          GridFavs.appendChild(clon);

          clon.querySelector(".NombreFav").textContent = b.titulo;
          clon.querySelector(".NumeroLikes").textContent = b.likes;

          const ImagenFav = clon.querySelector(".ImagenFav");
          try {
            const rImg = await fetch(API + "/obtener_imagen_build_" + b.id);
            if (rImg.status === 200) {
              const blob = await rImg.blob();
              const url = URL.createObjectURL(blob);
              ImagenFav.style.backgroundImage = "url('" + url + "')";
              ImagenFav.style.backgroundSize = "cover";
              ImagenFav.style.backgroundPosition = "center";
            } else {
              ImagenFav.style.background = "#d9d9d9";
              ImagenFav.style.backgroundImage = "";
            }
          } catch {
            ImagenFav.style.background = "#d9d9d9";
            ImagenFav.style.backgroundImage = "";
          }

          clon.addEventListener("click", function () {
            const idSeleccionado = Number(clon.dataset.buildId);
            localStorage.setItem("build_view", idSeleccionado);
            window.location.href = "viewer.html?id=" + idSeleccionado;
          });
        }
      }
    }
  } catch {
    if (GridFavs) GridFavs.innerHTML = "<div style='padding:16px'>Network error while loading builds</div>";
  }

  async function DibujarMisBuilds() {
    if (!ListaRecientes || !plantillaReciente) return;
    ListaRecientes.innerHTML = "";

    try {
      const r = await fetch(API + "/obtener_builds_usuario_" + id_usuario);
      if (r.status !== 200) {
        ListaRecientes.innerHTML = "<div style='padding:8px'>Error while loading builds</div>";
        return;
      }
      const datos = await r.json();
      const misBuilds = datos.builds || [];

      if (misBuilds.length === 0) {
        ListaRecientes.innerHTML = "<div style='padding:8px'>You have created no builds yet</div>";
        return;
      }

      for (let i = 0; i < misBuilds.length; i++) {
        const b = misBuilds[i];
        const item = plantillaReciente.cloneNode(true);
        item.style.display = "block";
        item.dataset.buildId = b.id;

        item.style.background = "#2b2f31";
        const texto = item.querySelector(".TextoReciente");
        if (texto) {
          texto.textContent = b.titulo || ("Build #" + b.id);
          texto.style.color = "#e6e6e6";
        }

        item.addEventListener("click", function () {
          const idSel = Number(item.dataset.buildId);
          localStorage.setItem("build_view", idSel);
          window.location.href = "viewer.html?id=" + idSel;
        });

        ListaRecientes.appendChild(item);
      }
    } catch {
      ListaRecientes.innerHTML = "<div style='padding:8px'>Network error while loading builds</div>";
    }
  }

  await DibujarMisBuilds();
})();
