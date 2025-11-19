(async function () {
  if (!await requireSessionOrRedirect()) return;

  const GridFavs = document.querySelector("#GridFavs");
  const plantillaFav = document.querySelector(".TarjetaFav");
  const ListaRecientes = document.querySelector("#ListaRecientes");
  const plantillaReciente = document.querySelector(".Reciente");
  const NombreUsuario = document.querySelector("#NombreUsuario");
  const FotoUsuario = document.querySelector("#Avatar");

  plantillaFav.style.display = "none";
  plantillaReciente.style.display = "none";

  const me = await getUsuarioActual()
  if (!me) { window.location.href = "sign_in.html"; return; }
  const id_usuario = me.id

  const indice = (me.nombre && me.nombre.length > 0) ? (me.nombre.trim().charAt(0) + ".") : ""
  const primerApellido = (me.apellido && me.apellido.length > 0) ? me.apellido.trim().split(" ")[0] : ""
  NombreUsuario.innerHTML = (indice + " " + primerApellido).trim()

  fetch("http://localhost:3000/obtener_imagen_usuario_" + id_usuario).then(r => {
    if (r.status === 200) {
      r.blob().then(img => {
        const url = URL.createObjectURL(img)
        if (FotoUsuario.tagName && FotoUsuario.tagName.toLowerCase() === "img") {
          FotoUsuario.src = url
        } else {
          FotoUsuario.style.backgroundImage = "url('" + url + "')"
          FotoUsuario.style.backgroundSize = "cover"
          FotoUsuario.style.backgroundPosition = "center"
        }
      })
    } else {
      if (FotoUsuario.tagName && FotoUsuario.tagName.toLowerCase() === "img") {
        FotoUsuario.src = ""
      } else {
        FotoUsuario.style.background = "#d9d9d9"
        FotoUsuario.style.backgroundImage = ""
      }
    }
  })

  const rf = await fetch("http://localhost:3000/obtener_favoritos_" + id_usuario)
  const favs = (await rf.json()).builds || []
  for (let i = 0; i < favs.length; i++) {
    const clon = plantillaFav.cloneNode(true);
    clon.style.display = "block";
    clon.dataset.buildId = favs[i].id
    GridFavs.appendChild(clon);

    clon.querySelector(".NombreFav").innerHTML = favs[i].titulo
    clon.querySelector(".NumeroLikes").innerHTML = favs[i].likes

    const ImagenFav = clon.querySelector(".ImagenFav");
    fetch("http://localhost:3000/obtener_imagen_build_" + favs[i].id).then(r => {
      if (r.status === 200) {
        r.blob().then(b => {
          const url = URL.createObjectURL(b)
          ImagenFav.style.backgroundImage = "url('" + url + "')"
          ImagenFav.style.backgroundSize = "cover"
          ImagenFav.style.backgroundPosition = "center"
        })
      } else {
        ImagenFav.style.background = "#d9d9d9"; ImagenFav.style.backgroundImage = ""
      }
    })

    clon.addEventListener("click", function () {
      const idSeleccionado = Number(clon.dataset.buildId)
      localStorage.setItem("build_view", idSeleccionado)
      let recientes = JSON.parse(localStorage.getItem("recientes_builds") || "[]")
      if (!recientes.includes(idSeleccionado)) {
        recientes.unshift(idSeleccionado)
        if (recientes.length > 5) recientes = recientes.slice(0, 5)
        localStorage.setItem("recientes_builds", JSON.stringify(recientes))
      }
      window.location.href = "viewer.html?id=" + idSeleccionado
    })
  }

  function DibujarRecientes() {
    ListaRecientes.innerHTML = ""
    const recientes = JSON.parse(localStorage.getItem("recientes_builds") || "[]")
    for (let i = 0; i < recientes.length; i++) {
      const item = plantillaReciente.cloneNode(true)
      item.style.display = "block"
      item.dataset.buildId = recientes[i]
      const FondoReciente = item.querySelector(".FondoReciente")
      const TextoReciente = item.querySelector(".TextoReciente")
      TextoReciente.innerHTML = "Build #" + recientes[i]
      fetch("http://localhost:3000/obtener_imagen_build_" + recientes[i]).then(r => {
        if (r.status === 200) {
          r.blob().then(b => { FondoReciente.style.backgroundImage = "url('" + URL.createObjectURL(b) + "')" })
        }
      })
      item.addEventListener("click", function () {
        const idSel = Number(item.dataset.buildId)
        localStorage.setItem("build_view", idSel)
        window.location.href = "viewer.html?id=" + idSel
      })
      ListaRecientes.appendChild(item)
    }
  }
  DibujarRecientes()
})();
