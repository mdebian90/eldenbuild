const in_email = document.querySelector("#in_email");
const in_pass = document.querySelector("#in_pass");
const in_submit = document.querySelector("#in_submit");

if (localStorage.getItem("token_eldenbuild")) {
  window.location.href = "favorites.html";
}

in_submit.addEventListener("click", function () {
  var datos = {
    correo: in_email.value,
    pass: in_pass.value
  };
  fetch("http://localhost:3000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  }).then(recurso => {
    if (recurso.status == 200) {
      recurso.json().then(respuesta => {
        localStorage.setItem("token_eldenbuild", respuesta.token);
        window.location.href = "favorites.html";
      });
    } else {
      alert("Email or password incorrect");
    }
  });
});
