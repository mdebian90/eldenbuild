const GridFavs = document.querySelector("#GridFavs");
const plantillaFav = document.querySelector(".TarjetaFav");
const ListaRecientes = document.querySelector("#ListaRecientes");
const plantillaReciente = document.querySelector(".Reciente");
const NombreUsuario = document.querySelector("#NombreUsuario");
const FotoUsuario = document.querySelector("#Avatar");

plantillaFav.style.display = "none";
plantillaReciente.style.display = "none";

NombreUsuario.innerHTML = "";

var id_usuario = 1;

fetch("http://localhost:3000/obtener_usuario_" + id_usuario).then(recurso => {
    if (recurso.status == 200) {
        recurso.json().then(respuesta => {
            var indice = "";
            if (respuesta.nombre && respuesta.nombre.length > 0) {
                indice = respuesta.nombre.trim().charAt(0) + ".";
            }
            var primerApellido = "";
            if (respuesta.apellido && respuesta.apellido.length > 0) {
                primerApellido = respuesta.apellido.trim().split(" ")[0];
            }
            NombreUsuario.innerHTML = (indice + " " + primerApellido).trim();
        });
        fetch("http://localhost:3000/obtener_imagen_usuario_" + id_usuario).then(recurso_iu => {
            if (recurso_iu.status == 200) {
                recurso_iu.blob().then(respuesta_iu => {
                    var url = URL.createObjectURL(respuesta_iu);
                    if (FotoUsuario) {
                        if (FotoUsuario.tagName && FotoUsuario.tagName.toLowerCase() === "img") {
                            FotoUsuario.src = url;
                        } else {
                            FotoUsuario.style.backgroundImage = "url('" + url + "')";
                            FotoUsuario.style.backgroundSize = "cover";
                            FotoUsuario.style.backgroundPosition = "center";
                        }
                    }
                });
            } else {
                if (FotoUsuario) {
                    if (FotoUsuario.tagName && FotoUsuario.tagName.toLowerCase() === "img") {
                        FotoUsuario.src = "";
                    } else {
                        FotoUsuario.style.background = "#d9d9d9";
                        FotoUsuario.style.backgroundImage = "";
                    }
                }
            }
        });
    } else {
        NombreUsuario.innerHTML = "";
    }
});

fetch("http://localhost:3000/obtener_favoritos_" + id_usuario).then(recurso => recurso.json()).then(respuesta => {
    for (i = 0; i < respuesta.builds.length; i++) {
        var clon = plantillaFav.cloneNode(true);
        GridFavs.appendChild(clon);
        clon.style.display = "block";

        const NombreFav = clon.querySelector(".NombreFav");
        NombreFav.innerHTML = respuesta.builds[i].titulo;

        const NumeroLikes = clon.querySelector(".NumeroLikes");
        NumeroLikes.innerHTML = respuesta.builds[i].likes;

        const ImagenFav = clon.querySelector(".ImagenFav");
        fetch("http://localhost:3000/obtener_imagen_build_" + respuesta.builds[i].id).then(recurso_ib => {
            if (recurso_ib.status == 200) {
                recurso_ib.blob().then(respuesta_ib => {
                    var url = URL.createObjectURL(respuesta_ib);
                    ImagenFav.style.backgroundImage = "url('" + url + "')";
                    ImagenFav.style.backgroundSize = "cover";
                    ImagenFav.style.backgroundPosition = "center";
                });
            }
            else {
                ImagenFav.style.background = "#d9d9d9";
                ImagenFav.style.backgroundImage = "";
            }
        });

        clon.addEventListener("click", function () {
            var recientes = JSON.parse(localStorage.getItem("recientes_builds") || "[]");
            var idtexto = NombreFav.innerHTML;
            var nuevo = [idtexto];
            for (j = 0; j < recientes.length; j++) {
                if (recientes[j] != idtexto) {
                    nuevo.push(recientes[j]);
                }
            }
            if (nuevo.length > 5) {
                nuevo = nuevo.slice(0, 5);
            }
            localStorage.setItem("recientes_builds", JSON.stringify(nuevo));
            DibujarRecientes();
        });
    }
});

function DibujarRecientes() {
    ListaRecientes.innerHTML = "";
    var recientes = JSON.parse(localStorage.getItem("recientes_builds") || "[]");
    for (i = 0; i < recientes.length; i++) {
        var recientes_b = plantillaReciente.cloneNode(true);
        ListaRecientes.appendChild(recientes_b);
        recientes_b.style.display = "block";
        const FondoReciente = recientes_b.querySelector(".FondoReciente");
        const TextoReciente = recientes_b.querySelector(".TextoReciente");
        FondoReciente.style.background = "#d9d9d9";
        TextoReciente.innerHTML = recientes[i];
    }
}

DibujarRecientes();
