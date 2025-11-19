let idUsuario = 0
  ; (async function () {
    if (!await requireSessionOrRedirect()) return
    const me = await getUsuarioActual()
    if (!me) { window.location.href = "sign_in.html"; return; }
    idUsuario = me.id
  })()

const InputCover = document.querySelector("#InputCover")
const NombreBuild = document.querySelector("#NombreBuild")
const GuardarBuild = document.querySelector("#GuardarBuild")
const CoverOK = document.querySelector("#CoverOK")

const ListaIdsAtributos = ["vigor", "mind", "endurance", "strength", "dexterity", "intelligence", "faith", "arcane"]
const CamposAtributos = ListaIdsAtributos.map(function (idCampo) { return document.querySelector("#" + idCampo) })
const TextoLevel = document.querySelector("#TextoLevel")
const TextoRunes = document.querySelector("#TextoRunes")

const CharacterName = document.querySelector("#CharacterName")
const SelectOrigin = document.querySelector("#SelectOrigin")
const ImgOrigin = document.querySelector("#ImgOrigin")
const HairSlot = document.querySelector("#HairSlot")

const Overlay = document.querySelector("#Overlay")
const PanelOpciones = document.querySelector("#PanelOpciones")
const InputSelectorOculto = document.querySelector("#InputSelectorOculto")

const RHGrupo = document.querySelector("#RHGrupo")
const LHGrupo = document.querySelector("#LHGrupo")
const ArmorGrupo = document.querySelector("#ArmorGrupo")
const TalismanGrupo = document.querySelector("#TalismanGrupo")

var BytesPortada = null
var OrigenSeleccionado = "Vagabond"

function LimitarNumero(textoNumero, minimo, maximo) {
  var numero = parseInt(textoNumero || "0")
  if (isNaN(numero)) numero = 0
  if (numero < minimo) numero = minimo
  if (numero > maximo) numero = maximo
  return numero
}

function CalcularNivel() {
  var sumaBase = 80
  var sumaAtributos = 0
  var i = 0
  for (i = 0; i < CamposAtributos.length; i++) {
    var valorAtributo = LimitarNumero(CamposAtributos[i].value, 1, 99)
    CamposAtributos[i].value = valorAtributo
    sumaAtributos += valorAtributo
  }
  var nivelCalculado = 1 + (sumaAtributos - sumaBase)
  if (nivelCalculado < 1) nivelCalculado = 1
  TextoLevel.innerHTML = String(nivelCalculado)
  var runasCalculadas = Math.floor(0.02 * nivelCalculado * nivelCalculado * nivelCalculado + 3 * nivelCalculado * nivelCalculado + 106 * nivelCalculado)
  if (runasCalculadas < 0) runasCalculadas = 0
  TextoRunes.innerHTML = String(runasCalculadas)
}

var i = 0
for (i = 0; i < CamposAtributos.length; i++) {
  CamposAtributos[i].addEventListener("input", CalcularNivel)
}

const BtnMenos = document.querySelectorAll(".BtnMenos")
var j = 0
for (j = 0; j < BtnMenos.length; j++) {
  BtnMenos[j].addEventListener("click", function (evento) {
    var campoObjetivo = document.querySelector("#" + evento.currentTarget.getAttribute("data-target"))
    campoObjetivo.value = LimitarNumero(parseInt(campoObjetivo.value || "0") - 1, 1, 99)
    CalcularNivel()
  })
}

const BtnMas = document.querySelectorAll(".BtnMas")
var k = 0
for (k = 0; k < BtnMas.length; k++) {
  BtnMas[k].addEventListener("click", function (evento) {
    var campoObjetivo = document.querySelector("#" + evento.currentTarget.getAttribute("data-target"))
    campoObjetivo.value = LimitarNumero(parseInt(campoObjetivo.value || "0") + 1, 1, 99)
    CalcularNivel()
  })
}

SelectOrigin.addEventListener("change", function () {
  OrigenSeleccionado = SelectOrigin.value
  var rutaImagen = "img/origin/" + OrigenSeleccionado.toLowerCase() + ".png"
  ImgOrigin.style.backgroundImage = "url('" + rutaImagen + "')"
})

HairSlot.addEventListener("click", function () {
  AbrirPanelOpciones("img/hairstyle", 24, null, HairSlot)
})

function LimpiarDuplicados(nombreGrupo, rutaSeleccionada, elementoExcepto) {
  var CuadroImg = document.querySelectorAll('.CuadroImg[data-group="' + nombreGrupo + '"]')
  var x = 0
  for (x = 0; x < CuadroImg.length; x++) {
    var cuadro = CuadroImg[x]
    var rutaActual = cuadro.getAttribute("data-src") || ""
    if (cuadro !== elementoExcepto && rutaActual === rutaSeleccionada) {
      cuadro.style.backgroundImage = ""
      cuadro.setAttribute("data-src", "")
    }
  }
}

function AsignarImagen(cuadroDestino, rutaImagen) {
  var grupo = cuadroDestino.getAttribute("data-group") || ""
  if (rutaImagen && (grupo === "hand" || grupo === "talisman")) {
    LimpiarDuplicados(grupo, rutaImagen, cuadroDestino)
  }
  if (rutaImagen) {
    cuadroDestino.style.backgroundImage = "url('" + rutaImagen + "')"
    cuadroDestino.setAttribute("data-src", rutaImagen)
  } else {
    cuadroDestino.style.backgroundImage = ""
    cuadroDestino.setAttribute("data-src", "")
  }
}

function ConectarGrupoCuadros(contenedorGrupo) {
  var CuadroImg = contenedorGrupo.querySelectorAll(".CuadroImg")
  var y = 0
  for (y = 0; y < CuadroImg.length; y++) {
    CuadroImg[y].addEventListener("click", function (evento) {
      var cuadro = evento.currentTarget
      var carpeta = cuadro.getAttribute("data-folder") || ""
      AbrirPanelOpciones(carpeta, 200, function (rutaElegida) {
        AsignarImagen(cuadro, rutaElegida)
      }, cuadro)
    })
  }
}

ConectarGrupoCuadros(RHGrupo)
ConectarGrupoCuadros(LHGrupo)
ConectarGrupoCuadros(ArmorGrupo)
ConectarGrupoCuadros(TalismanGrupo)

function AbrirPanelOpciones(carpetaBase, cantidadMaxima, funcionSeleccion, cuadroActual) {
  PanelOpciones.innerHTML = ""
  var rutasUsadas = {}
  if (cuadroActual) {
    var grupoActual = cuadroActual.getAttribute("data-group") || ""
    if (grupoActual !== "") {
      var CuadroImg = document.querySelectorAll('.CuadroImg[data-group="' + grupoActual + '"]')
      var z = 0
      for (z = 0; z < CuadroImg.length; z++) {
        var rutaUsada = CuadroImg[z].getAttribute("data-src") || ""
        if (rutaUsada) rutasUsadas[rutaUsada] = true
      }
    }
  }
  var opcionVacia = document.createElement("div")
  opcionVacia.className = "opcion-vacia"
  opcionVacia.addEventListener("click", function () {
    if (cuadroActual) {
      AsignarImagen(cuadroActual, null)
    } else if (funcionSeleccion) {
      funcionSeleccion("")
    }
    Overlay.classList.add("oculto")
  })
  PanelOpciones.appendChild(opcionVacia)
  function AgregarOpcion(ruta) {
    var imagen = document.createElement("img")
    imagen.src = ruta
    imagen.addEventListener("load", function () {
      if (rutasUsadas[ruta]) imagen.classList.add("usado")
      imagen.addEventListener("click", function (evento) {
        var rutaElegida = evento.target.src
        if (cuadroActual) {
          AsignarImagen(cuadroActual, rutaElegida)
        } else if (funcionSeleccion) {
          funcionSeleccion(rutaElegida)
        }
        Overlay.classList.add("oculto")
      })
      PanelOpciones.appendChild(imagen)
    })
    imagen.addEventListener("error", function () { })
  }
  var n = 0
  for (n = 1; n <= cantidadMaxima; n++) {
    AgregarOpcion(carpetaBase + "/" + n + ".png")
  }
  Overlay.classList.remove("oculto")
}

Overlay.addEventListener("click", function (evento) {
  if (evento.target === Overlay) {
    Overlay.classList.add("oculto")
  }
})

InputCover.addEventListener("change", function () {
  if (!InputCover.files || !InputCover.files[0]) {
    BytesPortada = null
    if (CoverOK) CoverOK.classList.add("oculto")
    return
  }
  var archivoPortada = InputCover.files[0]
  var lector = new FileReader()
  lector.onload = function () {
    try {
      var arreglo = new Uint8Array(lector.result)
      BytesPortada = Array.from(arreglo)
      if (CoverOK) CoverOK.classList.remove("oculto")
    } catch (e) {
      BytesPortada = null
      if (CoverOK) CoverOK.classList.add("oculto")
    }
  }
  lector.onerror = function () {
    BytesPortada = null
    if (CoverOK) CoverOK.classList.add("oculto")
  }
  lector.readAsArrayBuffer(archivoPortada)
})

function ObtenerNumero(cuadro) {
  var ruta = cuadro.getAttribute("data-src") || ""
  if (ruta === "") return null
  var nombreArchivo = ruta.split("/").pop().split(".")[0]
  var numero = parseInt(nombreArchivo || "0")
  if (isNaN(numero)) return null
  return numero
}

function NumerosDeGrupo(contenedorGrupo) {
  var lista = []
  var CuadroImg = contenedorGrupo.querySelectorAll(".CuadroImg")
  var m = 0
  for (m = 0; m < CuadroImg.length; m++) {
    lista.push(ObtenerNumero(CuadroImg[m]))
  }
  return lista
}

CalcularNivel()
SelectOrigin.dispatchEvent(new Event("change"))

GuardarBuild.addEventListener("click", function () {
  var nombreBuild = (NombreBuild.value || "").trim()
  if (nombreBuild === "") return
  fetch("http://localhost:3000/existe_build_" + encodeURIComponent(nombreBuild)).then(function (respuesta) {
    if (respuesta.status === 200) {
      respuesta.json().then(function (objeto) {
        if (objeto.existe === 1) {
          alert("A build with that name already exists")
        } else {
          EnviarBuild(nombreBuild)
        }
      })
    } else {
      EnviarBuild(nombreBuild)
    }
  })
})

function EnviarBuild(nombreBuild) {
  var datosEnviar = {
    id_usuario: idUsuario,
    titulo: nombreBuild,
    vigor: LimitarNumero(document.querySelector("#vigor").value, 1, 99),
    mind: LimitarNumero(document.querySelector("#mind").value, 1, 99),
    endurance: LimitarNumero(document.querySelector("#endurance").value, 1, 99),
    strength: LimitarNumero(document.querySelector("#strength").value, 1, 99),
    dexterity: LimitarNumero(document.querySelector("#dexterity").value, 1, 99),
    intelligence: LimitarNumero(document.querySelector("#intelligence").value, 1, 99),
    faith: LimitarNumero(document.querySelector("#faith").value, 1, 99),
    arcane: LimitarNumero(document.querySelector("#arcane").value, 1, 99),
    level: parseInt(TextoLevel.innerHTML || "1"),
    runes: parseInt(TextoRunes.innerHTML || "0"),
    character_name: (CharacterName.value || "").trim(),
    origin: OrigenSeleccionado,
    hairstyle: ObtenerNumero(HairSlot),
    rh: NumerosDeGrupo(RHGrupo),
    lh: NumerosDeGrupo(LHGrupo),
    armor: NumerosDeGrupo(ArmorGrupo),
    talisman: NumerosDeGrupo(TalismanGrupo),
    cover: BytesPortada
  }
  fetch("http://localhost:3000/crear_build", {
    method: "POST",
    body: JSON.stringify(datosEnviar)
  }).then(function (respuesta) {
    if (respuesta.status === 200) {
      alert("Build Saved")
      NombreBuild.value = ""
      BytesPortada = null
      if (CoverOK) CoverOK.classList.add("oculto")
    } else if (respuesta.status === 409) {
      respuesta.json().then(function (objeto) { alert(objeto.mensaje || "Duplicated") })
    } else if (respuesta.status === 400) {
      respuesta.json().then(function (objeto) { alert(objeto.mensaje || "Error") })
    } else {
      alert("Error")
    }
  })
}
