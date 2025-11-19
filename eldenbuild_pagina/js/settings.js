const id_usuario = 1;
const AvatarGrande = document.querySelector("#AvatarGrande");
const st_nombre = document.querySelector("#st_nombre");
const st_apellido = document.querySelector("#st_apellido");
const st_correo = document.querySelector("#st_correo");

fetch("http://localhost:3000/obtener_usuario_" + id_usuario).then(recurso => {
  if (recurso.status == 200) {
    recurso.json().then(respuesta => {
      st_nombre.value = respuesta.nombre || "";
      st_apellido.value = respuesta.apellido || "";
      st_correo.value = respuesta.correo || "";
    });
    fetch("http://localhost:3000/obtener_imagen_usuario_" + id_usuario).then(recurso_iu => {
      if (recurso_iu.status == 200) {
        recurso_iu.blob().then(respuesta_iu => {
          var url = URL.createObjectURL(respuesta_iu);
          AvatarGrande.style.backgroundImage = "url('" + url + "')";
        });
      } else {
        AvatarGrande.style.backgroundImage = "";
      }
    }).catch(() => {
      AvatarGrande.style.backgroundImage = "";
    });
  }
});
