const http = require("node:http");
const mysql = require("mysql");
const fs = require("node:fs");
const path = require("node:path");
const jwt = require("jsonwebtoken");

const PUERTO = 3000;
const DB_CFG = {
  host: "localhost",
  user: "root",
  password: "",
  database: "eldenbuild"
};
const JWT_SECRET = "17435DYJH13489GRSSQHUWI";

const RUTA_DEFAULT_BUILD = path.join(__dirname, "img", "default.png");

const pool = mysql.createPool(DB_CFG);

function enviarJSON(res, status, obj) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(obj));
}

function enviarPNG(res, status, buffer) {
  res.statusCode = status;
  res.setHeader("Content-Type", "image/png");
  res.end(buffer);
}

function leerCuerpo(req) {
  return new Promise((resolve, reject) => {
    const partes = [];
    req.on("data", (chunk) => partes.push(chunk));
    req.on("end", () => resolve(Buffer.concat(partes)));
    req.on("error", reject);
  });
}

function parseJSONSeguro(buffer) {
  try {
    return JSON.parse(buffer.toString() || "{}");
  } catch {
    return {};
  }
}

function extraerBearerId(req) {
  const auth = req.headers["authorization"] || "";
  const partes = auth.split(" ");
  if (partes.length === 2 && partes[0].toLowerCase() === "bearer") {
    try {
      const payload = jwt.verify(partes[1], JWT_SECRET);
      if (payload && typeof payload.id === "number") {
        return { ok: true, id: payload.id };
      }
    } catch (e) {
      return { ok: false, id: null, msg: "token invalido" };
    }
  }
  return { ok: false, id: null, msg: "sin token" };
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    if (req.method === "GET") {
      if (req.url === "/obtener_builds_explore") {
        pool.query(
          "SELECT id, titulo, likes FROM builds WHERE publica = 1 ORDER BY fecha DESC",
          (err, rows) => {
            if (err) {
              console.error("SQL obtener_builds_explore:", err.sqlMessage || err);
              return enviarJSON(res, 500, { mensaje: "error" });
            }
            enviarJSON(res, 200, { builds: rows });
          }
        );
        return;
      }

      if (req.url.startsWith("/obtener_build_")) {
        const id = parseInt(req.url.replace("/obtener_build_", "") || "0");
        if (!id) return enviarJSON(res, 400, { mensaje: "id invalido" });
        pool.query("SELECT * FROM builds WHERE id = ?", [id], (err, rows) => {
          if (err) {
            console.error("SQL obtener_build:", err.sqlMessage || err);
            return enviarJSON(res, 500, { mensaje: "error" });
          }
          if (!rows || rows.length === 0) return enviarJSON(res, 404, { mensaje: "not found" });
          const b = rows[0];
          enviarJSON(res, 200, {
            id: b.id,
            id_usuario: b.id_usuario,
            titulo: b.titulo,
            nivel: b.nivel,
            runas: b.runas,
            personaje: b.personaje,
            origen: b.origen,
            peinado: b.peinado,
            vigor: b.vigor,
            mind: b.mind,
            endurance: b.endurance,
            strength: b.strength,
            dexterity: b.dexterity,
            intelligence: b.intelligence,
            faith: b.faith,
            arcane: b.arcane,
            likes: b.likes,
            rh1: b.rh1, rh2: b.rh2, rh3: b.rh3, rh4: b.rh4, rh5: b.rh5,
            lh1: b.lh1, lh2: b.lh2, lh3: b.lh3, lh4: b.lh4, lh5: b.lh5,
            ar1: b.ar1, ar2: b.ar2, ar3: b.ar3, ar4: b.ar4,
            ta1: b.ta1, ta2: b.ta2, ta3: b.ta3, ta4: b.ta4
          });
        });
        return;
      }

      if (req.url.startsWith("/obtener_favoritos_")) {
        const idUsuario = parseInt(req.url.replace("/obtener_favoritos_", "") || "0");
        if (!idUsuario) return enviarJSON(res, 400, { mensaje: "id invalido" });
        pool.query(
          "SELECT b.id, b.titulo, b.likes FROM favoritos f INNER JOIN builds b ON b.id = f.id_build WHERE f.id_usuario = ? ORDER BY f.fecha DESC",
          [idUsuario],
          (err, rows) => {
            if (err) {
              console.error("SQL obtener_favoritos:", err.sqlMessage || err);
              return enviarJSON(res, 500, { mensaje: "error" });
            }
            enviarJSON(res, 200, { builds: rows });
          }
        );
        return;
      }

      if (req.url.startsWith("/obtener_imagen_build_")) {
        const id = parseInt(req.url.replace("/obtener_imagen_build_", "") || "0");
        if (!id) return enviarJSON(res, 400, { mensaje: "id invalido" });

        pool.query("SELECT imagen FROM builds WHERE id = ?", [id], (err, rows) => {
          if (err) {
            console.error("SQL obtener_imagen_build:", err.sqlMessage || err);
            return enviarJSON(res, 404, { mensaje: "error" });
          }
          let buf = null;
          if (rows && rows.length > 0 && rows[0].imagen) {
            buf = rows[0].imagen;
          } else if (fs.existsSync(RUTA_DEFAULT_BUILD)) {
            buf = fs.readFileSync(RUTA_DEFAULT_BUILD);
          }
          if (buf) return enviarPNG(res, 200, buf);
          enviarJSON(res, 404, { mensaje: "not found" });
        });
        return;
      }

      if (req.url.startsWith("/obtener_usuario_")) {
        const id = parseInt(req.url.replace("/obtener_usuario_", "") || "0");
        if (!id) return enviarJSON(res, 400, { mensaje: "id invalido" });
        pool.query(
          "SELECT nombre, apellido, correo FROM usuarios WHERE id = ?",
          [id],
          (err, rows) => {
            if (err) {
              console.error("SQL obtener_usuario_id:", err.sqlMessage || err);
              return enviarJSON(res, 500, { mensaje: "error" });
            }
            if (!rows || rows.length === 0) return enviarJSON(res, 404, { mensaje: "not found" });
            enviarJSON(res, 200, rows[0]);
          }
        );
        return;
      }

      if (req.url.startsWith("/obtener_imagen_usuario_")) {
        const id = parseInt(req.url.replace("/obtener_imagen_usuario_", "") || "0");
        if (!id) return enviarJSON(res, 400, { mensaje: "id invalido" });
        pool.query("SELECT imagen FROM usuarios WHERE id = ?", [id], (err, rows) => {
          if (err) {
            console.error("SQL obtener_imagen_usuario:", err.sqlMessage || err);
            return enviarJSON(res, 404, { mensaje: "error" });
          }
          if (rows && rows.length > 0 && rows[0].imagen) {
            return enviarPNG(res, 200, rows[0].imagen);
          }
          enviarJSON(res, 404, { mensaje: "not found" });
        });
        return;
      }

      if (req.url.startsWith("/existe_build_")) {
        const enc = req.url.replace("/existe_build_", "");
        const titulo = decodeURIComponent(enc || "");
        pool.query(
          "SELECT COUNT(*) c FROM builds WHERE titulo = ?",
          [titulo],
          (err, rows) => {
            if (err) {
              console.error("SQL existe_build:", err.sqlMessage || err);
              return enviarJSON(res, 500, { mensaje: "error" });
            }
            enviarJSON(res, 200, { existe: rows[0].c > 0 ? 1 : 0 });
          }
        );
        return;
      }

      if (req.url === "/obtener_usuario") {
        const auth = extraerBearerId(req);
        if (!auth.ok || !auth.id) {
          return enviarJSON(res, 401, { mensaje: "no autorizado" });
        }
        pool.query(
          "SELECT id, nombre, apellido, correo, contrasena FROM usuarios WHERE id = ?",
          [auth.id],
          (err, rows) => {
            if (err) {
              console.error("SQL obtener_usuario(token):", err.sqlMessage || err);
              return enviarJSON(res, 500, { mensaje: "error" });
            }
            if (!rows || rows.length === 0) return enviarJSON(res, 404, { mensaje: "not found" });
            const u = rows[0];
            enviarJSON(res, 200, {
              id: u.id,
              nombre: u.nombre,
              apellido: u.apellido,
              correo: u.correo,
              pass: u.contrasena
            });
          }
        );
        return;
      }

      if (req.url.startsWith("/obtener_builds_usuario_")) {
        const idUsuario = parseInt(req.url.replace("/obtener_builds_usuario_", "") || "0");
        if (!idUsuario) return enviarJSON(res, 400, { mensaje: "id invalido" });
        pool.query(
          "SELECT id, titulo, likes FROM builds WHERE id_usuario = ? ORDER BY fecha DESC",
          [idUsuario],
          (err, rows) => {
            if (err) return enviarJSON(res, 500, { mensaje: "error" });
            enviarJSON(res, 200, { builds: rows || [] });
          }
        );
        return;
      }


      enviarJSON(res, 404, { mensaje: "not found" });
      return;
    }

    if (req.method === "POST") {
      if (req.url === "/crear_build") {
        const body = await leerCuerpo(req);
        const data = parseJSONSeguro(body);

        const titulo = (data.titulo || "").trim();
        if (titulo === "") return enviarJSON(res, 400, { mensaje: "titulo vacio" });

        pool.query("SELECT COUNT(*) c FROM builds WHERE titulo = ?", [titulo], (err, rows) => {
          if (err) {
            console.error("SQL existe_build:", err.sqlMessage || err);
            return enviarJSON(res, 500, { mensaje: "error" });
          }
          if (rows[0].c > 0) return enviarJSON(res, 409, { mensaje: "ya existe" });

          let cover = null;
          if (Array.isArray(data.cover) && data.cover.length > 0) {
            try { cover = Buffer.from(Uint8Array.from(data.cover)); } catch { cover = null; }
          }

          const rh = Array.isArray(data.rh) ? data.rh : [null, null, null, null, null];
          const lh = Array.isArray(data.lh) ? data.lh : [null, null, null, null, null];
          const armor = Array.isArray(data.armor) ? data.armor : [null, null, null, null];
          const talisman = Array.isArray(data.talisman) ? data.talisman : [null, null, null, null];

          const valores = [
            data.id_usuario || 1,
            titulo,
            cover,
            data.vigor || 10,
            data.mind || 10,
            data.endurance || 10,
            data.strength || 10,
            data.dexterity || 10,
            data.intelligence || 10,
            data.faith || 10,
            data.arcane || 10,
            data.level || 1,
            data.runes || 0,
            data.character_name || "",
            data.origin || "Wretch",
            data.hairstyle || null,
            rh[0] || null, rh[1] || null, rh[2] || null, rh[3] || null, rh[4] || null,
            lh[0] || null, lh[1] || null, lh[2] || null, lh[3] || null, lh[4] || null,
            armor[0] || null, armor[1] || null, armor[2] || null, armor[3] || null,
            talisman[0] || null, talisman[1] || null, talisman[2] || null, talisman[3] || null,
            1
          ];

          const sql =
            "INSERT INTO builds (" +
            "id_usuario,titulo,imagen," +
            "vigor,mind,endurance,strength,dexterity,intelligence,faith,arcane," +
            "nivel,runas,personaje,origen,peinado," +
            "rh1,rh2,rh3,rh4,rh5," +
            "lh1,lh2,lh3,lh4,lh5," +
            "ar1,ar2,ar3,ar4," +
            "ta1,ta2,ta3,ta4," +
            "publica,fecha" +
            ") VALUES (" +
            new Array(34).fill("?").join(",") +
            ",?, NOW()" +
            ")";

          pool.query(sql, valores, (err2, r2) => {
            if (err2) {
              console.error("SQL crear_build:", err2.sqlMessage || err2);
              return enviarJSON(res, 500, { mensaje: "error" });
            }
            enviarJSON(res, 200, { mensaje: "ok", id: r2.insertId });
          });
        });
        return;
      }

      if (req.url === "/agregar_favorito") {
        const body = await leerCuerpo(req);
        const data = parseJSONSeguro(body);
        const id_usuario = parseInt(data.id_usuario || 0);
        const id_build = parseInt(data.id_build || 0);
        if (!id_usuario || !id_build) return enviarJSON(res, 400, { mensaje: "datos invalidos" });

        pool.query(
          "SELECT COUNT(*) c FROM favoritos WHERE id_usuario = ? AND id_build = ?",
          [id_usuario, id_build],
          (err, rows) => {
            if (err) {
              console.error("SQL fav check:", err.sqlMessage || err);
              return enviarJSON(res, 500, { mensaje: "error" });
            }
            if (rows[0].c > 0) return enviarJSON(res, 200, { mensaje: "ya existe" });

            pool.query(
              "INSERT INTO favoritos (id_usuario, id_build) VALUES (?, ?)",
              [id_usuario, id_build],
              (err2) => {
                if (err2) {
                  console.error("SQL fav insert:", err2.sqlMessage || err2);
                  return enviarJSON(res, 500, { mensaje: "error" });
                }
                enviarJSON(res, 200, { mensaje: "ok" });
              }
            );
          }
        );
        return;
      }

      if (req.url.startsWith("/sumar_like_")) {
        const id = parseInt(req.url.replace("/sumar_like_", "") || "0");
        if (!id) return enviarJSON(res, 400, { mensaje: "id invalido" });
        pool.query("UPDATE builds SET likes = likes + 1 WHERE id = ?", [id], (err, r) => {
          if (err) {
            console.error("SQL sumar_like:", err.sqlMessage || err);
            return enviarJSON(res, 500, { mensaje: "error" });
          }
          if (r.affectedRows === 0) return enviarJSON(res, 404, { mensaje: "not found" });
          enviarJSON(res, 200, { mensaje: "ok" });
        });
        return;
      }

      if (req.url.startsWith("/restar_like_")) {
        const id = parseInt(req.url.replace("/restar_like_", "") || "0");
        if (!id) return enviarJSON(res, 400, { mensaje: "id invalido" });
        pool.query(
          "UPDATE builds SET likes = GREATEST(likes - 1, 0) WHERE id = ?",
          [id],
          (err, r) => {
            if (err) {
              console.error("SQL restar_like:", err.sqlMessage || err);
              return enviarJSON(res, 500, { mensaje: "error" });
            }
            if (r.affectedRows === 0) return enviarJSON(res, 404, { mensaje: "not found" });
            enviarJSON(res, 200, { mensaje: "ok" });
          }
        );
        return;
      }

      if (req.url === "/login") {
        const body = await leerCuerpo(req);
        const data = parseJSONSeguro(body);
        const correo = (data.correo || "").trim();
        const pass = (data.pass || "").trim();
        if (!correo || !pass) return enviarJSON(res, 400, { mensaje: "datos invalidos" });

        pool.query(
          "SELECT id, contrasena FROM usuarios WHERE correo = ?",
          [correo],
          (err, rows) => {
            if (err) {
              console.error("SQL login:", err.sqlMessage || err);
              return enviarJSON(res, 500, { mensaje: "error" });
            }
            if (!rows || rows.length === 0) return enviarJSON(res, 401, { mensaje: "incorrecto" });
            const u = rows[0];
            if (u.contrasena !== pass) return enviarJSON(res, 401, { mensaje: "incorrecto" });
            const token = jwt.sign({ id: u.id }, JWT_SECRET, { expiresIn: "7d" });
            enviarJSON(res, 200, { token });
          }
        );
        return;
      }

      if (req.url === "/registro") {
        const body = await leerCuerpo(req);
        const data = parseJSONSeguro(body);
        const nombre = (data.nombre || "").trim();
        const apellido = (data.apellido || "").trim();
        const correo = (data.correo || "").trim();
        const pass = (data.pass || "").trim();

        if (!nombre || !apellido || !correo || !pass) {
          return enviarJSON(res, 400, { mensaje: "datos incompletos" });
        }

        pool.query(
          "SELECT COUNT(*) c FROM usuarios WHERE correo = ?",
          [correo],
          (err, rows) => {
            if (err) {
              console.error("SQL registro check:", err.sqlMessage || err);
              return enviarJSON(res, 500, { mensaje: "error" });
            }
            if (rows[0].c > 0) return enviarJSON(res, 409, { mensaje: "correo ya registrado" });

            pool.query(
              "INSERT INTO usuarios (nombre, apellido, correo, contrasena) VALUES (?, ?, ?, ?)",
              [nombre, apellido, correo, pass],
              (err2) => {
                if (err2) {
                  console.error("SQL registro insert:", err2.sqlMessage || err2);
                  return enviarJSON(res, 500, { mensaje: "error" });
                }
                enviarJSON(res, 200, { mensaje: "ok" });
              }
            );
          }
        );
        return;
      }

      enviarJSON(res, 404, { mensaje: "no permitido" });
      return;
    }

    if (req.method === "PUT") {
      if (req.url.startsWith("/editar_build_")) {
        const id = parseInt(req.url.replace("/editar_build_", "") || "0");
        if (!id) return enviarJSON(res, 400, { mensaje: "id invalido" });

        const body = await leerCuerpo(req);
        const data = parseJSONSeguro(body);

        const titulo = (data.titulo || "").trim();

        let cover = null;
        let actualizarImagen = false;
        if (Array.isArray(data.cover)) {
          actualizarImagen = true;
          if (data.cover.length > 0) {
            try { cover = Buffer.from(Uint8Array.from(data.cover)); } catch { cover = null; }
          } else {
            cover = null;
          }
        }

        const rh = Array.isArray(data.rh) ? data.rh : [null, null, null, null, null];
        const lh = Array.isArray(data.lh) ? data.lh : [null, null, null, null, null];
        const armor = Array.isArray(data.armor) ? data.armor : [null, null, null, null];
        const talisman = Array.isArray(data.talisman) ? data.talisman : [null, null, null, null];

        const sets = [];
        const vals = [];

        if (titulo !== "") { sets.push("titulo = ?"); vals.push(titulo); }
        if (actualizarImagen) { sets.push("imagen = ?"); vals.push(cover); }

        sets.push("vigor = ?", "mind = ?", "endurance = ?", "strength = ?", "dexterity = ?", "intelligence = ?", "faith = ?", "arcane = ?");
        vals.push(
          data.vigor || 10, data.mind || 10, data.endurance || 10, data.strength || 10,
          data.dexterity || 10, data.intelligence || 10, data.faith || 10, data.arcane || 10
        );

        sets.push("nivel = ?", "runas = ?", "personaje = ?", "origen = ?", "peinado = ?");
        vals.push(
          data.level || 1, data.runes || 0, data.character_name || "", data.origin || "Wretch",
          data.hairstyle || null
        );

        sets.push("rh1 = ?", "rh2 = ?", "rh3 = ?", "rh4 = ?", "rh5 = ?");
        vals.push(rh[0] || null, rh[1] || null, rh[2] || null, rh[3] || null, rh[4] || null);
        sets.push("lh1 = ?", "lh2 = ?", "lh3 = ?", "lh4 = ?", "lh5 = ?");
        vals.push(lh[0] || null, lh[1] || null, lh[2] || null, lh[3] || null, lh[4] || null);
        sets.push("ar1 = ?", "ar2 = ?", "ar3 = ?", "ar4 = ?");
        vals.push(armor[0] || null, armor[1] || null, armor[2] || null, armor[3] || null);
        sets.push("ta1 = ?", "ta2 = ?", "ta3 = ?", "ta4 = ?");
        vals.push(talisman[0] || null, talisman[1] || null, talisman[2] || null, talisman[3] || null);

        const sql = "UPDATE builds SET " + sets.join(", ") + " WHERE id = ?";
        vals.push(id);

        pool.query(sql, vals, (err, r) => {
          if (err) {
            console.error("SQL editar_build:", err.sqlMessage || err);
            return enviarJSON(res, 500, { mensaje: "error" });
          }
          if (r.affectedRows === 0) return enviarJSON(res, 404, { mensaje: "not found" });
          enviarJSON(res, 200, { mensaje: "ok" });
        });
        return;
      }

      if (req.url.startsWith("/actualizar_foto_")) {
        const id = parseInt(req.url.replace("/actualizar_foto_", "") || "0");
        if (!id) return enviarJSON(res, 400, { mensaje: "id invalido" });

        const bin = await leerCuerpo(req);
        const valorImagen = bin && bin.length > 0 ? bin : null;

        pool.query(
          "UPDATE usuarios SET imagen = ? WHERE id = ?",
          [valorImagen, id],
          (err, r) => {
            if (err) {
              console.error("SQL actualizar_foto:", err.sqlMessage || err);
              return enviarJSON(res, 500, { mensaje: "error" });
            }
            if (r.affectedRows === 0) return enviarJSON(res, 404, { mensaje: "not found" });
            enviarJSON(res, 200, { mensaje: "ok" });
          }
        );
        return;
      }

      if (req.url.startsWith("/actualizar_usuario_")) {
        const id = parseInt(req.url.replace("/actualizar_usuario_", "") || "0");
        if (!id) return enviarJSON(res, 400, { mensaje: "id invalido" });

        const body = await leerCuerpo(req);
        const data = parseJSONSeguro(body);

        const nombre = (data.nombre || "").trim();
        const apellido = (data.apellido || "").trim();
        const correo = (data.correo || "").trim();
        const pass = (data.pass || "").trim();

        if (!nombre || !apellido || !correo || !pass) {
          return enviarJSON(res, 400, { mensaje: "datos incompletos" });
        }

        pool.query(
          "SELECT COUNT(*) c FROM usuarios WHERE correo = ? AND id <> ?",
          [correo, id],
          (err, rows) => {
            if (err) {
              console.error("SQL actualizar_usuario check:", err.sqlMessage || err);
              return enviarJSON(res, 500, { mensaje: "error" });
            }
            if (rows[0].c > 0) return enviarJSON(res, 409, { mensaje: "correo ya registrado" });

            pool.query(
              "UPDATE usuarios SET nombre = ?, apellido = ?, correo = ?, contrasena = ? WHERE id = ?",
              [nombre, apellido, correo, pass, id],
              (err2, r2) => {
                if (err2) {
                  console.error("SQL actualizar_usuario update:", err2.sqlMessage || err2);
                  return enviarJSON(res, 500, { mensaje: "error" });
                }
                if (r2.affectedRows === 0) return enviarJSON(res, 404, { mensaje: "not found" });
                enviarJSON(res, 200, { mensaje: "ok" });
              }
            );
          }
        );
        return;
      }

      enviarJSON(res, 404, { mensaje: "no permitido" });
      return;
    }

    if (req.method === "DELETE") {
      if (req.url.startsWith("/eliminar_build_")) {
        const id = parseInt(req.url.replace("/eliminar_build_", "") || "0");
        if (!id) return enviarJSON(res, 400, { mensaje: "id invalido" });
        pool.query("DELETE FROM builds WHERE id = ?", [id], (err, r) => {
          if (err) {
            console.error("SQL eliminar_build:", err.sqlMessage || err);
            return enviarJSON(res, 500, { mensaje: "error" });
          }
          if (r.affectedRows === 0) return enviarJSON(res, 404, { mensaje: "not found" });
          enviarJSON(res, 200, { mensaje: "ok" });
        });
        return;
      }

      if (req.url.startsWith("/eliminar_usuario_")) {
        const id = parseInt(req.url.replace("/eliminar_usuario_", "") || "0");
        if (!id) return enviarJSON(res, 400, { mensaje: "id invalido" });
        pool.query("DELETE FROM usuarios WHERE id = ?", [id], (err, r) => {
          if (err) {
            console.error("SQL eliminar_usuario:", err.sqlMessage || err);
            return enviarJSON(res, 500, { mensaje: "error" });
          }
          if (r.affectedRows === 0) return enviarJSON(res, 404, { mensaje: "not found" });
          enviarJSON(res, 200, { mensaje: "ok" });
        });
        return;
      }

      if (req.url === "/eliminar_favorito") {
        const body = await leerCuerpo(req);
        const data = parseJSONSeguro(body);
        const id_usuario = parseInt(data.id_usuario || 0);
        const id_build = parseInt(data.id_build || 0);
        if (!id_usuario || !id_build) return enviarJSON(res, 400, { mensaje: "datos invalidos" });

        pool.query(
          "DELETE FROM favoritos WHERE id_usuario = ? AND id_build = ?",
          [id_usuario, id_build],
          (err, r) => {
            if (err) {
              console.error("SQL eliminar_favorito:", err.sqlMessage || err);
              return enviarJSON(res, 500, { mensaje: "error" });
            }
            enviarJSON(res, 200, { mensaje: "ok" });
          }
        );
        return;
      }

      enviarJSON(res, 404, { mensaje: "no permitido" });
      return;
    }

    enviarJSON(res, 404, { mensaje: "no permitido" });
  } catch (e) {
    console.error("Handler error:", e);
    enviarJSON(res, 500, { mensaje: "error" });
  }
});

server.listen(PUERTO, () => {
  console.log("Servidor a la escucha en http://localhost:" + PUERTO);
});
