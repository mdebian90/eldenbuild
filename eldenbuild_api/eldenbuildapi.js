const http = require("node:http");
const basesdatos = require("mysql");

const puerto = 3000;

const server = http.createServer((request, response) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");

    const conexion_db = basesdatos.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "eldenbuild"
    });

    switch (request.method) {
        case "GET":
            if (request.url === "/obtener_builds_explore") {
                conexion_db.query("SELECT id, titulo, likes FROM builds WHERE publica = 1 ORDER BY fecha DESC", (err, resultado) => {
                    if (err) {
                        response.statusCode = 500;
                        response.setHeader("Content-Type", "application/json");
                        response.end(JSON.stringify({ "mensaje": "error" }));
                        conexion_db.end();
                    } else {
                        response.statusCode = 200;
                        response.setHeader("Content-Type", "application/json");
                        response.end(JSON.stringify({ "builds": resultado }));
                        conexion_db.end();
                    }
                });
            } else if (request.url.startsWith("/obtener_favoritos_")) {
                var idusuario_favoritos = request.url.replace("/obtener_favoritos_", "");
                conexion_db.query("SELECT b.id, b.titulo, b.likes FROM favoritos f INNER JOIN builds b ON b.id = f.id_build WHERE f.id_usuario = ? ORDER BY f.fecha DESC", [idusuario_favoritos], (err, resultado) => {
                    if (err) {
                        response.statusCode = 500;
                        response.setHeader("Content-Type", "application/json");
                        response.end(JSON.stringify({ "mensaje": "error" }));
                        conexion_db.end();
                    } else {
                        response.statusCode = 200;
                        response.setHeader("Content-Type", "application/json");
                        response.end(JSON.stringify({ "builds": resultado }));
                        conexion_db.end();
                    }
                });
            } else if (request.url.startsWith("/obtener_imagen_build_")) {
                var idusuario_imagen_build = request.url.replace("/obtener_imagen_build_", "");
                conexion_db.query("SELECT imagen FROM builds WHERE id = ?", [idusuario_imagen_build], (err, resultado) => {
                    if (err) {
                        response.statusCode = 404;
                        response.setHeader("Content-Type", "application/json");
                        response.end(JSON.stringify({ "mensaje": "error" }));
                        conexion_db.end();
                    } else {
                        if (resultado.length > 0 && resultado[0].imagen) {
                            response.statusCode = 200;
                            response.end(resultado[0].imagen);
                            conexion_db.end();
                        } else {
                            response.statusCode = 404;
                            response.setHeader("Content-Type", "application/json");
                            response.end(JSON.stringify({ "mensaje": "not found" }));
                            conexion_db.end();
                        }
                    }
                });
            } else if (request.url.startsWith("/obtener_usuario_")) {
                var idusuario = request.url.replace("/obtener_usuario_", "");
                conexion_db.query("SELECT nombre, apellido FROM usuarios WHERE id = ?", [idusuario], (err, resultado) => {
                    if (err) {
                        response.statusCode = 500;
                        response.setHeader("Content-Type", "application/json");
                        response.end(JSON.stringify({ "mensaje": "error" }));
                        conexion_db.end();
                    } else {
                        if (resultado.length > 0) {
                            response.statusCode = 200;
                            response.setHeader("Content-Type", "application/json");
                            response.end(JSON.stringify({ "nombre": resultado[0].nombre, "apellido": resultado[0].apellido }));
                            conexion_db.end();
                        } else {
                            response.statusCode = 404;
                            response.setHeader("Content-Type", "application/json");
                            response.end(JSON.stringify({ "mensaje": "not found" }));
                            conexion_db.end();
                        }
                    }
                });
            } else if (request.url.startsWith("/obtener_imagen_usuario_")) {
                var idusuario_imagen_usuario = request.url.replace("/obtener_imagen_usuario_", "");
                conexion_db.query("SELECT imagen FROM usuarios WHERE id = ?", [idusuario_imagen_usuario], (err, resultado) => {
                    if (err) {
                        response.statusCode = 404;
                        response.setHeader("Content-Type", "application/json");
                        response.end(JSON.stringify({ "mensaje": "error" }));
                        conexion_db.end();
                    } else {
                        if (resultado.length > 0 && resultado[0].imagen) {
                            response.statusCode = 200;
                            response.end(resultado[0].imagen);
                            conexion_db.end();
                        } else {
                            response.statusCode = 404;
                            response.setHeader("Content-Type", "application/json");
                            response.end(JSON.stringify({ "mensaje": "not found" }));
                            conexion_db.end();
                        }
                    }
                });
            } else {
                response.statusCode = 404;
                response.setHeader("Content-Type", "application/json");
                response.end(JSON.stringify({ "mensaje": "not found" }));
                conexion_db.end();
            }
            break;
        case "OPTIONS":
            response.writeHead(204);
            response.end();
            break;
        default:
            response.statusCode = 404;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ "mensaje": "no permitido" }));
            break;
    }
});

server.listen(puerto, () => {
    console.log("Servidor a la escucha en http://localhost:" + puerto);
});
