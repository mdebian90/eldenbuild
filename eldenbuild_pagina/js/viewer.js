let idUsuario = 0;

; (async function () {
  if (typeof adjustNav === "function") adjustNav();
  if (typeof requireAuth === "function") {
    const ok = await requireAuth();
    if (!ok) return;
  }
  await initUser();
  await CargarBuild();
})();

const NombreBuildTexto = document.querySelector("#NombreBuildTexto");
const AgregarFavoritos = document.querySelector("#AgregarFavoritos");
const FavOK = document.querySelector("#FavOK");
const EditarBuildLink = document.querySelector("#EditarBuildLink");
const LikeZona = document.querySelector("#LikeZona");
const BtnLike = document.querySelector("#BtnLike");
const LikesNumero = document.querySelector("#LikesNumero");

const TextoLevel = document.querySelector("#TextoLevel");
const TextoRunes = document.querySelector("#TextoRunes");
const CharacterNameTexto = document.querySelector("#CharacterNameTexto");
const ImgOrigin = document.querySelector("#ImgOrigin");
const HairSlot = document.querySelector("#HairSlot");

const RHGrupo = document.querySelector("#RHGrupo");
const LHGrupo = document.querySelector("#LHGrupo");
const ArmorGrupo = document.querySelector("#ArmorGrupo");
const TalismanGrupo = document.querySelector("#TalismanGrupo");

const vigorValor = document.querySelector("#vigorValor");
const mindValor = document.querySelector("#mindValor");
const enduranceValor = document.querySelector("#enduranceValor");
const strengthValor = document.querySelector("#strengthValor");
const dexterityValor = document.querySelector("#dexterityValor");
const intelligenceValor = document.querySelector("#intelligenceValor");
const faithValor = document.querySelector("#faithValor");
const arcaneValor = document.querySelector("#arcaneValor");

let IdBuild = null;
let Propietario = null;
let EstadoLike = 0;
let LikesActuales = 0;
let FavoritoEstado = 0;

function ObtenerParametro(nombre) {
  const p = new URLSearchParams(location.search);
  return p.get(nombre);
}

function PintarGrupoEstatico(contenedor, arr) {
  const CuadroImg = contenedor.querySelectorAll(".CuadroImg");
  for (let i = 0; i < CuadroImg.length; i++) {
    const n = arr[i];
    if (n != null) {
      const folder = CuadroImg[i].getAttribute("data-folder") || "";
      const ruta = folder + "/" + n + ".png";
      CuadroImg[i].style.backgroundImage = "url('" + ruta + "')";
      CuadroImg[i].setAttribute("data-src", ruta);
    } else {
      CuadroImg[i].style.backgroundImage = "";
      CuadroImg[i].setAttribute("data-src", "");
    }
  }
}

async function initUser() {
  const me = await getUsuarioActual();
  idUsuario = me ? Number(me.id) : 0;
}

async function verificarFavorito() {
  if (!idUsuario || !IdBuild) return;
  try {
    const r = await fetch(API + "/obtener_favoritos_" + idUsuario);
    if (r.status !== 200) return;
    const o = await r.json();
    const lista = o.builds || [];
    const existe = lista.some(b => Number(b.id) === Number(IdBuild));
    FavoritoEstado = existe ? 1 : 0;
    AgregarFavoritos.textContent = FavoritoEstado ? "Remove from favorites" : "Add to favorites";
    if (FavoritoEstado) FavOK.classList.remove("oculto"); else FavOK.classList.add("oculto");
  } catch { }
}

function actualizarIconoLike() {
  if (!BtnLike) return;
  if (EstadoLike === 1) {
    BtnLike.style.backgroundImage = "url('img/heart_filled.png')";
  } else {
    BtnLike.style.backgroundImage = "url('img/heart_regular.png')";
  }
}

async function CargarBuild() {
  IdBuild = ObtenerParametro("id") || localStorage.getItem("build_view");
  if (!IdBuild) return;
  IdBuild = Number(IdBuild);

  const r = await fetch(API + "/obtener_build_" + IdBuild);
  if (r.status !== 200) return;
  const b = await r.json();

  const titulo = b.titulo || "";
  NombreBuildTexto.textContent = "Build Name: " + titulo;

  TextoLevel.textContent = String(b.nivel || 1);
  TextoRunes.textContent = String(b.runas || 0);
  CharacterNameTexto.textContent = b.personaje || "";

  Propietario = Number(b.id_usuario || 0);
  LikesActuales = Number(b.likes || 0);
  LikesNumero.textContent = String(LikesActuales);

  const origen = (b.origen || "Wretch").toLowerCase();
  ImgOrigin.style.backgroundImage = "url('img/origin/" + origen + ".png')";
  if (b.peinado != null) {
    HairSlot.style.backgroundImage = "url('img/hairstyle/" + b.peinado + ".png')";
    HairSlot.setAttribute("data-src", "img/hairstyle/" + b.peinado + ".png");
  } else {
    HairSlot.style.backgroundImage = "";
    HairSlot.setAttribute("data-src", "");
  }

  vigorValor.textContent = String(b.vigor || 10);
  mindValor.textContent = String(b.mind || 10);
  enduranceValor.textContent = String(b.endurance || 10);
  strengthValor.textContent = String(b.strength || 10);
  dexterityValor.textContent = String(b.dexterity || 10);
  intelligenceValor.textContent = String(b.intelligence || 10);
  faithValor.textContent = String(b.faith || 10);
  arcaneValor.textContent = String(b.arcane || 10);

  const rh = [b.rh1, b.rh2, b.rh3, b.rh4, b.rh5];
  const lh = [b.lh1, b.lh2, b.lh3, b.lh4, b.lh5];
  const ar = [b.ar1, b.ar2, b.ar3, b.ar4];
  const ta = [b.ta1, b.ta2, b.ta3, b.ta4];
  PintarGrupoEstatico(RHGrupo, rh);
  PintarGrupoEstatico(LHGrupo, lh);
  PintarGrupoEstatico(ArmorGrupo, ar);
  PintarGrupoEstatico(TalismanGrupo, ta);

  if (idUsuario && idUsuario === Propietario) {
    EditarBuildLink.classList.remove("oculto");
    EditarBuildLink.href = "editor.html?id=" + IdBuild;
    EditarBuildLink.innerHTML = "Edit<br>build";

    LikeZona.classList.add("oculto");
    LikeZona.style.display = "none";
    LikeZona.setAttribute("aria-hidden", "true");

    AgregarFavoritos.classList.add("oculto");
    FavOK.classList.add("oculto");
  } else {
    EditarBuildLink.classList.add("oculto");

    LikeZona.classList.remove("oculto");
    LikeZona.style.display = "";
    LikeZona.removeAttribute("aria-hidden");

    AgregarFavoritos.classList.remove("oculto");

    const likesLocal = JSON.parse(localStorage.getItem("liked_builds") || "[]");
    EstadoLike = likesLocal.indexOf(String(IdBuild)) >= 0 ? 1 : 0;
    actualizarIconoLike();
    await verificarFavorito();
  }

}

AgregarFavoritos.addEventListener("click", async function () {
  if (!IdBuild || !idUsuario) return;

  if (FavoritoEstado === 0) {
    const r = await fetch(API + "/agregar_favorito", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_usuario: idUsuario, id_build: IdBuild })
    });
    if (r.status === 200) {
      FavOK.classList.remove("oculto");
      FavoritoEstado = 1;
      AgregarFavoritos.textContent = "Remove from favorites";
    }
  } else {
    const r = await fetch(API + "/eliminar_favorito", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_usuario: idUsuario, id_build: IdBuild })
    });
    if (r.status === 200) {
      FavoritoEstado = 0;
      AgregarFavoritos.textContent = "Add to favorites";
      FavOK.classList.add("oculto");
    }
  }
});

BtnLike.addEventListener("click", function () {
  if (!IdBuild) return;

  if (EstadoLike === 0) {
    fetch(API + "/sumar_like_" + IdBuild, { method: "POST" }).then(function (r) {
      if (r.status === 200) {
        LikesActuales = LikesActuales + 1;
        LikesNumero.textContent = String(LikesActuales);
        EstadoLike = 1;
        actualizarIconoLike();
        const likesLocal = JSON.parse(localStorage.getItem("liked_builds") || "[]");
        if (likesLocal.indexOf(String(IdBuild)) < 0) likesLocal.push(String(IdBuild));
        localStorage.setItem("liked_builds", JSON.stringify(likesLocal));
      }
    });
  } else {
    fetch(API + "/restar_like_" + IdBuild, { method: "POST" }).then(function (r) {
      if (r.status === 200) {
        if (LikesActuales > 0) LikesActuales = LikesActuales - 1;
        LikesNumero.textContent = String(LikesActuales);
        EstadoLike = 0;
        actualizarIconoLike();
        const likesLocal = JSON.parse(localStorage.getItem("liked_builds") || "[]");
        const idx = likesLocal.indexOf(String(IdBuild));
        if (idx >= 0) likesLocal.splice(idx, 1);
        localStorage.setItem("liked_builds", JSON.stringify(likesLocal));
      }
    });
  }
});
