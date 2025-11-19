const su_nombre = document.querySelector("#su_nombre");
const su_apellido = document.querySelector("#su_apellido");
const su_correo = document.querySelector("#su_correo");
const su_pass = document.querySelector("#su_pass");
const su_submit = document.querySelector("#su_submit");

if (localStorage.getItem("token_eldenbuild")) {
  window.location.href = "favorites.html";
}

su_submit.addEventListener("click", function () {
  var datos = {
    nombre: su_nombre.value,
    apellido: su_apellido.value,
    correo: su_correo.value,
    pass: su_pass.value
  };
  fetch("http://localhost:3000/registro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  }).then(recurso => {
    if (recurso.status == 200) {
      alert("Account created successfully");
      window.location.href = "sign_in.html";
    } else if (recurso.status == 409) {
      alert("This email is already registered");
    } else {
      alert("Error creating account");
    }
  });
});
