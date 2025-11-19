const token = localStorage.getItem("token_eldenbuild");
if (!token) {
  window.location.href = "sign_in.html";
}

const AvatarGrande = document.querySelector("#AvatarGrande");
const st_nombre = document.querySelector("#st_nombre");
const st_apellido = document.querySelector("#st_apellido");
const st_correo = document.querySelector("#st_correo");
const st_pass = document.querySelector("#st_pass");
const InputPhoto = document.querySelector("#InputPhoto");
const GuardarCambios = document.querySelector("#GuardarCambios");
const EliminarCuenta = document.querySelector("#EliminarCuenta");
const SignOut = document.querySelector("#SignOut");

var id_usuario = 0;
var confirmarEliminacion = false;

fetch("http://localhost:3000/obtener_usuario", {
  method: "GET",
  headers: { Authorization: "Bearer " + token }
}).then(recurso => {
  if (recurso.status == 200) {
    recurso.json().then(respuesta => {
      id_usuario = respuesta.id;
      st_nombre.value = respuesta.nombre || "";
      st_apellido.value = respuesta.apellido || "";
      st_correo.value = respuesta.correo || "";
      st_pass.value = respuesta.pass || "";
      fetch("http://localhost:3000/obtener_imagen_usuario_" + id_usuario).then(r2 => {
        if (r2.status == 200) {
          r2.blob().then(img => {
            var url = URL.createObjectURL(img);
            AvatarGrande.style.backgroundImage = "url('" + url + "')";
          });
        } else {
          AvatarGrande.style.backgroundImage = "url('img/default.png')";
        }
      }).catch(() => {
        AvatarGrande.style.backgroundImage = "url('img/default.png')";
      });
    });
  } else {
    localStorage.removeItem("token_eldenbuild");
    window.location.href = "sign_in.html";
  }
});

InputPhoto.addEventListener("change", function () {
  if (InputPhoto.files.length > 0 && id_usuario > 0) {
    const archivo = InputPhoto.files[0];
    fetch("http://localhost:3000/actualizar_foto_" + id_usuario, {
      method: "PUT",
      body: archivo
    }).then(r => {
      if (r.status == 200) {
        var url = URL.createObjectURL(archivo);
        AvatarGrande.style.backgroundImage = "url('" + url + "')";
      }
    });
  }
});

GuardarCambios.addEventListener("click", function () {
  if (id_usuario == 0) return;
  var datos = {
    nombre: st_nombre.value,
    apellido: st_apellido.value,
    correo: st_correo.value,
    pass: st_pass.value
  };
  fetch("http://localhost:3000/actualizar_usuario_" + id_usuario, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  }).then(r => {
    if (r.status == 200) {
      alert("Changes saved successfully");
    }
  });
});

EliminarCuenta.addEventListener("click", function (e) {
  e.preventDefault();
  if (!confirmarEliminacion) {
    alert("All your account information will be deleted, if are you really sure to continue, click the button again");
    confirmarEliminacion = true;
    return;
  }
  if (id_usuario > 0) {
    fetch("http://localhost:3000/eliminar_usuario_" + id_usuario, { method: "DELETE" }).then(r => {
      if (r.status == 200) {
        alert("Account deleted successfully");
        localStorage.removeItem("token_eldenbuild");
        window.location.href = "sign_in.html";
      }
    });
  }
});

SignOut.addEventListener("click", function () {
  localStorage.removeItem("token_eldenbuild");
});
