const GridExplorar = document.querySelector("#GridExplorar");
const plantilla = document.querySelector(".TarjetaBuild");
const Buscar = document.querySelector("#Buscar");

plantilla.style.display = "none";

var datos = [];

fetch("http://localhost:3000/obtener_builds_explore").then(recurso => recurso.json()).then(respuesta => {
    datos = respuesta.builds;
    for (i = 0; i < datos.length; i++) {
        var clon = plantilla.cloneNode(true);
        GridExplorar.appendChild(clon);
        clon.style.display = "block";

        const NombreBuild = clon.querySelector(".NombreBuild");
        NombreBuild.innerHTML = datos[i].titulo;

        const NumeroLikes = clon.querySelector(".NumeroLikes");
        NumeroLikes.innerHTML = datos[i].likes;

        const ImagenBuild = clon.querySelector(".ImagenBuild");
        fetch("http://localhost:3000/obtener_imagen_build_" + datos[i].id).then(recurso_ib => {
            if (recurso_ib.status == 200) {
                recurso_ib.blob().then(respuesta_ib => {
                    var url = URL.createObjectURL(respuesta_ib);
                    ImagenBuild.style.backgroundImage = "url('" + url + "')";
                });
            }
            else {
                ImagenBuild.style.background = "#d9d9d9";
            }
        });
    }
});

Buscar.addEventListener("input", function () {
    var texto = Buscar.value.toLowerCase();
    var tarjetas = GridExplorar.querySelectorAll(".TarjetaBuild");
    var indice = 0;
    for (indice = 0; indice < tarjetas.length; indice++) {
        const nombre = tarjetas[indice].querySelector(".NombreBuild").innerHTML.toLowerCase();
        if (nombre.includes(texto)) {
            tarjetas[indice].style.display = "block";
        }
        else {
            tarjetas[indice].style.display = "none";
        }
    }
});
