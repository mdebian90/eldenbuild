let idUsuario = 0
const NombreBuildTexto = document.querySelector("#NombreBuildTexto")
const AgregarFavoritos = document.querySelector("#AgregarFavoritos")
const FavOK = document.querySelector("#FavOK")
const EditarBuildLink = document.querySelector("#EditarBuildLink")
const LikeZona = document.querySelector("#LikeZona")
const BtnLike = document.querySelector("#BtnLike")
const LikesNumero = document.querySelector("#LikesNumero")

const TextoLevel = document.querySelector("#TextoLevel")
const TextoRunes = document.querySelector("#TextoRunes")
const CharacterNameTexto = document.querySelector("#CharacterNameTexto")
const ImgOrigin = document.querySelector("#ImgOrigin")
const HairSlot = document.querySelector("#HairSlot")

const RHGrupo = document.querySelector("#RHGrupo")
const LHGrupo = document.querySelector("#LHGrupo")
const ArmorGrupo = document.querySelector("#ArmorGrupo")
const TalismanGrupo = document.querySelector("#TalismanGrupo")

const vigorValor = document.querySelector("#vigorValor")
const mindValor = document.querySelector("#mindValor")
const enduranceValor = document.querySelector("#enduranceValor")
const strengthValor = document.querySelector("#strengthValor")
const dexterityValor = document.querySelector("#dexterityValor")
const intelligenceValor = document.querySelector("#intelligenceValor")
const faithValor = document.querySelector("#faithValor")
const arcaneValor = document.querySelector("#arcaneValor")

let IdBuild = null
let Propietario = null
let EstadoLike = 0
let LikesActuales = 0
let FavoritoEstado = 0

function ObtenerParametro(nombre) {
  const p = new URLSearchParams(location.search)
  return p.get(nombre)
}
function PintarGrupoEstatico(contenedor, arr) {
  const CuadroImg = contenedor.querySelectorAll(".CuadroImg")
  for (let i = 0; i < CuadroImg.length; i++) {
    const n = arr[i]
    if (n != null) {
      const folder = CuadroImg[i].getAttribute("data-folder") || ""
      const ruta = folder + "/" + n + ".png"
      CuadroImg[i].style.backgroundImage = "url('" + ruta + "')"
      CuadroImg[i].setAttribute("data-src", ruta)
    } else {
      CuadroImg[i].style.backgroundImage = ""
      CuadroImg[i].setAttribute("data-src", "")
    }
  }
}

async function initUser() {
  const me = await getUsuarioActual()
  idUsuario = me ? me.id : 0
}

async function verificarFavorito() {
  if (!idUsuario || !IdBuild) return
  const r = await fetch("http://localhost:3000/es_favorito_" + idUsuario + "_" + IdBuild)
  if (r.status === 200) {
    const o = await r.json()
    FavoritoEstado = o.favorito ? 1 : 0
    AgregarFavoritos.textContent = FavoritoEstado ? "Remove from favorites" : "Add to favorites"
  }
}

async function CargarBuild() {
  IdBuild = ObtenerParametro("id") || localStorage.getItem("build_view")
  if (!IdBuild) return
  const r = await fetch("http://localhost:3000/obtener_build_" + IdBuild)
  if (r.status !== 200) return
  const b = await r.json()

  NombreBuildTexto.innerHTML = b.titulo || ""
  TextoLevel.innerHTML = String(b.nivel || 1)
  TextoRunes.innerHTML = String(b.runas || 0)
  CharacterNameTexto.innerHTML = b.personaje || ""
  Propietario = b.id_usuario || 0
  LikesActuales = b.likes || 0
  LikesNumero.innerHTML = String(LikesActuales)
  const origen = b.origen || "Wretch"
  ImgOrigin.style.backgroundImage = "url('img/origin/" + origen.toLowerCase() + ".png')"
  if (b.peinado != null) {
    HairSlot.style.backgroundImage = "url('img/hairstyle/" + b.peinado + ".png')"
    HairSlot.setAttribute("data-src", "img/hairstyle/" + b.peinado + ".png")
  } else {
    HairSlot.style.backgroundImage = ""
    HairSlot.setAttribute("data-src", "")
  }
  vigorValor.innerHTML = String(b.vigor || 10)
  mindValor.innerHTML = String(b.mind || 10)
  enduranceValor.innerHTML = String(b.endurance || 10)
  strengthValor.innerHTML = String(b.strength || 10)
  dexterityValor.innerHTML = String(b.dexterity || 10)
  intelligenceValor.innerHTML = String(b.intelligence || 10)
  faithValor.innerHTML = String(b.faith || 10)
  arcaneValor.innerHTML = String(b.arcane || 10)
  const rh = [b.rh1, b.rh2, b.rh3, b.rh4, b.rh5]
  const lh = [b.lh1, b.lh2, b.lh3, b.lh4, b.lh5]
  const ar = [b.ar1, b.ar2, b.ar3, b.ar4]
  const ta = [b.ta1, b.ta2, b.ta3, b.ta4]
  PintarGrupoEstatico(RHGrupo, rh)
  PintarGrupoEstatico(LHGrupo, lh)
  PintarGrupoEstatico(ArmorGrupo, ar)
  PintarGrupoEstatico(TalismanGrupo, ta)

  if (idUsuario === Propietario) {
    EditarBuildLink.classList.remove("oculto")
    EditarBuildLink.href = "editor.html?id=" + IdBuild
    LikeZona.classList.add("oculto")
    AgregarFavoritos.classList.add("oculto")
  } else {
    LikeZona.classList.remove("oculto")
    EditarBuildLink.classList.add("oculto")
    AgregarFavoritos.classList.remove("oculto")

    const likesLocal = JSON.parse(localStorage.getItem("liked_builds") || "[]")
    EstadoLike = (likesLocal.indexOf(String(IdBuild)) >= 0) ? 1 : 0
    await verificarFavorito()
  }
}

AgregarFavoritos.addEventListener("click", async function () {
  if (!IdBuild || !idUsuario) return
  if (FavoritoEstado === 0) {
    const r = await fetch("http://localhost:3000/agregar_favorito", {
      method: "POST",
      body: JSON.stringify({ id_usuario: idUsuario, id_build: Number(IdBuild) })
    })
    if (r.status === 200) {
      FavOK.classList.remove("oculto")
      FavoritoEstado = 1
      AgregarFavoritos.textContent = "Remove from favorites"
    }
  } else {
    const r = await fetch("http://localhost:3000/quitar_favorito", {
      method: "POST",
      body: JSON.stringify({ id_usuario: idUsuario, id_build: Number(IdBuild) })
    })
    if (r.status === 200) {
      FavoritoEstado = 0
      AgregarFavoritos.textContent = "Add to favorites"
      FavOK.classList.add("oculto")
    }
  }
})

BtnLike.addEventListener("click", function () {
  if (!IdBuild) return
  if (EstadoLike === 0) {
    fetch("http://localhost:3000/sumar_like_" + IdBuild, { method: "POST" }).then(function (r) {
      if (r.status === 200) {
        LikesActuales = LikesActuales + 1
        LikesNumero.innerHTML = String(LikesActuales)
        EstadoLike = 1
        const likesLocal = JSON.parse(localStorage.getItem("liked_builds") || "[]")
        if (likesLocal.indexOf(String(IdBuild)) < 0) likesLocal.push(String(IdBuild))
        localStorage.setItem("liked_builds", JSON.stringify(likesLocal))
      }
    })
  } else {
    fetch("http://localhost:3000/restar_like_" + IdBuild, { method: "POST" }).then(function (r) {
      if (r.status === 200) {
        if (LikesActuales > 0) LikesActuales = LikesActuales - 1
        LikesNumero.innerHTML = String(LikesActuales)
        EstadoLike = 0
        const likesLocal = JSON.parse(localStorage.getItem("liked_builds") || "[]")
        const idx = likesLocal.indexOf(String(IdBuild))
        if (idx >= 0) likesLocal.splice(idx, 1)
        localStorage.setItem("liked_builds", JSON.stringify(likesLocal))
      }
    })
  }
})

  ; (async function () {
    await initUser()
    await CargarBuild()
  })();
