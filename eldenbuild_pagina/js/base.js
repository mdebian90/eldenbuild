const API = "http://localhost:3000";

function getToken() {
  return localStorage.getItem("token_eldenbuild") || "";
}

function isLoggedIn() {
  return !!getToken();
}

async function getUsuarioActual() {
  const token = getToken();
  if (!token) return null;
  try {
    const r = await fetch(API + "/obtener_usuario", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });
    if (r.status !== 200) return null;
    const u = await r.json();
    if (u && typeof u.id !== "number") u.id = Number(u.id || 0);
    return u;
  } catch {
    return null;
  }
}

async function requireAuth(options = { redirect: true }) {
  if (isLoggedIn()) return true;

  if (options.redirect !== false) {
    const href = (location.pathname || "").toLowerCase();
    const onAuthPage =
      href.endsWith("/sign_in.html") ||
      href.endsWith("/sign_up.html") ||
      href.endsWith("/index.html") ||
      href.endsWith("/");
    if (!onAuthPage) window.location.href = "sign_in.html";
  }
  return false;
}

function adjustNav() {
  const navBtns = document.querySelector("#BotonesNav");
  if (!navBtns) return;
  navBtns.style.display = isLoggedIn() ? "flex" : "none";
}

function setupIndexPage() {
  adjustNav();

  const btnSignIn = document.getElementById("btnSignIn");
  const btnSignUp = document.getElementById("btnSignUp");

  if (!btnSignIn || !btnSignUp) return;

  if (isLoggedIn()) {
    btnSignIn.style.display = "none";
    btnSignUp.style.display = "none";
  } else {
    btnSignIn.style.display = "inline-block";
    btnSignUp.style.display = "inline-block";

    btnSignIn.onclick = () => (window.location.href = "sign_in.html");
    btnSignUp.onclick = () => (window.location.href = "sign_up.html");
  }
}

function logout() {
  localStorage.removeItem("token_eldenbuild");
  window.location.href = "index.html";
}
