export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { username, password, action } = body;
        const email = body.email || ""; 
        
        // Obtenemos el SALT de seguridad de las variables de entorno
        const SALT = env.SALT_TOKEN || "";

        if (!username || !password) {
            return new Response(JSON.stringify({ 
                error: "Agatha: Identificación incompleta. Faltan datos." 
            }), { 
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Combinamos la contraseña con el SALT
        const securePassword = password + SALT;

        // IMPORTANTE: Asegúrate de que tu binding en Cloudflare Pages se llame 'DB' 
        // (o cámbialo aquí a env.db si la configuraste en minúscula).
        const database = env.DB || env.db;

        if (!database) {
            throw new Error("La base de datos D1 no está enlazada correctamente en el entorno.");
        }

        // --- REGISTRO ---
        if (action === 'register') {
            try {
                await database.prepare(
                    "INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)"
                ).bind(username, email, securePassword).run();

                return new Response(JSON.stringify({ 
                    success: true,
                    message: "Identidad creada con éxito en el núcleo de Génesis AI." 
                }), {
                    headers: { "Content-Type": "application/json" },
                    status: 200
                });
            } catch (dbError) {
                return new Response(JSON.stringify({ 
                    success: false,
                    error: "Agatha: Error al registrar. ¿El usuario o correo ya existen?" 
                }), { 
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }
        }

        // --- LOGIN ---
        if (action === 'login') {
            const user = await database.prepare(
                "SELECT username FROM usuarios WHERE username = ? AND password = ?"
            ).bind(username, securePassword).first();

            if (user) {
                return new Response(JSON.stringify({ 
                    success: true,
                    message: "Acceso concedido", 
                    user: user.username 
                }), {
                    headers: { "Content-Type": "application/json" },
                    status: 200
                });
            } else {
                return new Response(JSON.stringify({ 
                    success: false,
                    error: "Agatha: Identidad no confirmada. Credenciales inválidas." 
                }), {
                    headers: { "Content-Type": "application/json" },
                    status: 401
                });
            }
        }

        return new Response(JSON.stringify({ error: "Acción no reconocida por el núcleo." }), { 
            status: 400,
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ 
            success: false,
            error: "Fallo crítico en el servidor: " + err.message 
        }), {
            headers: { "Content-Type": "application/json" },
            status: 500
        });
    }
}
