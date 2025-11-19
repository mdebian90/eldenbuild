const API = "http://localhost:3000";

function getToken() {
  return localStorage.getItem("token_eldenbuild") || "";
}

function isLoggedIn() {
  return !!getToken();
}

async function requireAuth(options = { redirect: true }) {
  if (isLoggedIn()) {

    return true;
  }
  if (options.redirect !== false) {

    const href = (location.pathname || "").toLowerCase();
    const onAuthPage = href.endsWith("/sign_in.html") || href.endsWith("/sign_up.html");
    if (!onAuthPage) {
      window.location.href = "sign_in.html";
    }
  }
  return false;
}

function adjustNav() {
  const navBtns = document.querySelector("#BotonesNav");
  if (!navBtns) return;

  if (isLoggedIn()) {
    navBtns.style.display = "flex";
  } else {
    navBtns.style.display = "none";
  }
}

function adjustIndexAuthButtons() {
  const signInBtn = document.querySelector("#btn_sign_in");
  const signUpBtn = document.querySelector("#btn_sign_up");
  if (!signInBtn && !signUpBtn) return;

  if (isLoggedIn()) {
    if (signInBtn) signInBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "favorites.html";
    });
    if (signUpBtn) signUpBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "favorites.html";
    });
  }
}

function logout() {
  localStorage.removeItem("token_eldenbuild");
  window.location.href = "index.html";
}
