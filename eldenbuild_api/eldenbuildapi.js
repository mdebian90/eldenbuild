const http = require("node:http")
const basesdatos = require("mysql")
const fs = require("node:fs")
const path = require("node:path")

const puerto = 3000

const server = http.createServer((request, response) => {
    response.setHeader("Access-Control-Allow-Origin", "*")
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
    response.setHeader("Access-Control-Allow-Headers", "*")

    const conexion_db = basesdatos.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "eldenbuild"
    })

    switch (request.method) {
        case "GET":
            if (request.url === "/obtener_builds_explore") {
                conexion_db.query("SELECT id, titulo, likes FROM builds WHERE publica = 1 ORDER BY fecha DESC", (err, resultado) => {
                    if (err) {
                        response.statusCode = 500
                        response.setHeader("Content-Type", "application/json")
                        response.end(JSON.stringify({ "mensaje": "error" }))
                        conexion_db.end()
                    } else {
                        response.statusCode = 200
                        response.setHeader("Content-Type", "application/json")
                        response.end(JSON.stringify({ "builds": resultado }))
                        conexion_db.end()
                    }
                })
                return
            }

            if (request.url.startsWith("/obtener_favoritos_")) {
                var idusuario_favoritos = request.url.replace("/obtener_favoritos_", "")
                conexion_db.query("SELECT b.id, b.titulo, b.likes FROM favoritos f INNER JOIN builds b ON b.id = f.id_build WHERE f.id_usuario = ? ORDER BY f.fecha DESC", [idusuario_favoritos], (err, resultado) => {
                    if (err) {
                        response.statusCode = 500
                        response.setHeader("Content-Type", "application/json")
                        response.end(JSON.stringify({ "mensaje": "error" }))
                        conexion_db.end()
                    } else {
                        response.statusCode = 200
                        response.setHeader("Content-Type", "application/json")
                        response.end(JSON.stringify({ "builds": resultado }))
                        conexion_db.end()
                    }
                })
                return
            }

            if (request.url.startsWith("/obtener_imagen_build_")) {
                var id_build = request.url.replace("/obtener_imagen_build_", "")
                conexion_db.query("SELECT imagen FROM builds WHERE id = ?", [id_build], (err, resultado) => {
                    if (err) {
                        response.statusCode = 404
                        response.setHeader("Content-Type", "application/json")
                        response.end(JSON.stringify({ "mensaje": "error" }))
                        conexion_db.end()
                    } else {
                        var buf = null
                        if (resultado.length > 0 && resultado[0].imagen) {
                            buf = resultado[0].imagen
                        } else {
                            var ruta = path.join(__dirname, "img", "default.png")
                            if (fs.existsSync(ruta)) {
                                buf = fs.readFileSync(ruta)
                            }
                        }
                        if (buf) {
                            response.statusCode = 200
                            response.setHeader("Content-Type", "image/png")
                            response.end(buf)
                            conexion_db.end()
                        } else {
                            response.statusCode = 404
                            response.setHeader("Content-Type", "application/json")
                            response.end(JSON.stringify({ "mensaje": "not found" }))
                            conexion_db.end()
                        }
                    }
                })
                return
            }

            if (request.url.startsWith("/obtener_usuario_")) {
                var idusuario = request.url.replace("/obtener_usuario_", "")
                conexion_db.query("SELECT nombre, apellido, correo FROM usuarios WHERE id = ?", [idusuario], (err, resultado) => {
                    if (err) {
                        response.statusCode = 500
                        response.setHeader("Content-Type", "application/json")
                        response.end(JSON.stringify({ "mensaje": "error" }))
                        conexion_db.end()
                    } else {
                        if (resultado.length > 0) {
                            response.statusCode = 200
                            response.setHeader("Content-Type", "application/json")
                            response.end(JSON.stringify({ "nombre": resultado[0].nombre, "apellido": resultado[0].apellido, "correo": resultado[0].correo }))
                            conexion_db.end()
                        } else {
                            response.statusCode = 404
                            response.setHeader("Content-Type", "application/json")
                            response.end(JSON.stringify({ "mensaje": "not found" }))
                            conexion_db.end()
                        }
                    }
                })
                return
            }

            if (request.url.startsWith("/obtener_imagen_usuario_")) {
                var idusuario_imagen = request.url.replace("/obtener_imagen_usuario_", "")
                conexion_db.query("SELECT imagen FROM usuarios WHERE id = ?", [idusuario_imagen], (err, resultado) => {
                    if (err) {
                        response.statusCode = 404
                        response.setHeader("Content-Type", "application/json")
                        response.end(JSON.stringify({ "mensaje": "error" }))
                        conexion_db.end()
                    } else {
                        if (resultado.length > 0 && resultado[0].imagen) {
                            response.statusCode = 200
                            response.setHeader("Content-Type", "image/png")
                            response.end(resultado[0].imagen)
                            conexion_db.end()
                        } else {
                            response.statusCode = 404
                            response.setHeader("Content-Type", "application/json")
                            response.end(JSON.stringify({ "mensaje": "not found" }))
                            conexion_db.end()
                        }
                    }
                })
                return
            }

            if (request.url.startsWith("/existe_build_")) {
                var titulo_enc = request.url.replace("/existe_build_", "")
                var titulo = decodeURIComponent(titulo_enc)
                conexion_db.query("SELECT COUNT(*) c FROM builds WHERE titulo = ?", [titulo], (err, resultado) => {
                    if (err) {
                        response.statusCode = 500
                        response.setHeader("Content-Type", "application/json")
                        response.end(JSON.stringify({ "mensaje": "error" }))
                        conexion_db.end()
                    } else {
                        response.statusCode = 200
                        response.setHeader("Content-Type", "application/json")
                        response.end(JSON.stringify({ "existe": resultado[0].c > 0 ? 1 : 0 }))
                        conexion_db.end()
                    }
                })
                return
            }

            response.statusCode = 404
            response.setHeader("Content-Type", "application/json")
            response.end(JSON.stringify({ "mensaje": "not found" }))
            conexion_db.end()
            break

        case "POST":
            if (request.url === "/crear_build") {
                var informacion = ""
                request.on("data", info => informacion += info.toString())
                request.on("end", () => {
                    var data = {}
                    try { data = JSON.parse(informacion) } catch (_) { data = {} }

                    var titulo = (data.titulo || "").trim()
                    if (titulo === "") {
                        response.statusCode = 400
                        response.setHeader("Content-Type", "application/json")
                        response.end(JSON.stringify({ "mensaje": "titulo vacio" }))
                        conexion_db.end()
                        return
                    }

                    conexion_db.query("SELECT COUNT(*) c FROM builds WHERE titulo = ?", [titulo], (err, resultado) => {
                        if (err) {
                            response.statusCode = 500
                            response.setHeader("Content-Type", "application/json")
                            response.end(JSON.stringify({ "mensaje": "error" }))
                            conexion_db.end()
                            return
                        }
                        if (resultado[0].c > 0) {
                            response.statusCode = 409
                            response.setHeader("Content-Type", "application/json")
                            response.end(JSON.stringify({ "mensaje": "ya existe" }))
                            conexion_db.end()
                            return
                        }

                        var cover = null
                        if (Array.isArray(data.cover) && data.cover.length > 0) {
                            try {
                                cover = Buffer.from(Uint8Array.from(data.cover))
                            } catch (_) {
                                cover = null
                            }
                        }

                        var rh = Array.isArray(data.rh) ? data.rh : [null, null, null, null, null]
                        var lh = Array.isArray(data.lh) ? data.lh : [null, null, null, null, null]
                        var armor = Array.isArray(data.armor) ? data.armor : [null, null, null, null]
                        var talisman = Array.isArray(data.talisman) ? data.talisman : [null, null, null, null]

                        var valores = [
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
                            talisman[0] || null, talisman[1] || null, talisman[2] || null, talisman[3] || null
                        ]

                        var valores_insert = "INSERT INTO builds (id_usuario,titulo,imagen,vigor,mind,endurance,strength,dexterity,intelligence,faith,arcane,nivel,runas,personaje,origen,peinado,rh1,rh2,rh3,rh4,rh5,lh1,lh2,lh3,lh4,lh5,ar1,ar2,ar3,ar4,ta1,ta2,ta3,ta4) VALUES (" + new Array(valores.length).fill("?").join(",") + ")"

                        conexion_db.query(valores_insert, valores, (err, resultado) => {
                            if (err) {
                                response.statusCode = 500
                                response.setHeader("Content-Type", "application/json")
                                response.end(JSON.stringify({ "mensaje": "error" }))
                                conexion_db.end()
                            } else {
                                response.statusCode = 200
                                response.setHeader("Content-Type", "application/json")
                                response.end(JSON.stringify({ "mensaje": "ok", "id": resultado.insertId }))
                                conexion_db.end()
                            }
                        })
                    })
                })
                return
            }

            response.statusCode = 404
            response.setHeader("Content-Type", "application/json")
            response.end(JSON.stringify({ "mensaje": "no permitido" }))
            conexion_db.end()
            break

        case "OPTIONS":
            response.writeHead(204);
            response.end();
            break;

        default:
            response.statusCode = 404
            response.setHeader("Content-Type", "application/json")
            response.end(JSON.stringify({ "mensaje": "no permitido" }))
            conexion_db.end()
            break
    }
})

server.listen(puerto, () => {
    console.log("Servidor a la escucha en http://localhost:" + puerto)
})
