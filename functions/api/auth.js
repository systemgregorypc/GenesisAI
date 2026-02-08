export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { username, password, action } = body;
        const email = body.email || ""; 

        if (!username || !password) {
            return new Response(JSON.stringify({ 
                error: "Agatha: Identificación incompleta." 
            }), { 
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // --- REGISTRO ---
        if (action === 'register') {
            try {
                // Usamos la tabla 'usuarios' y la base de datos 'db' en minúsculas
                await env.db.prepare(
                    "INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)"
                ).bind(username, email, password).run();

                return new Response(JSON.stringify({ 
                    message: "Identidad creada con éxito en el núcleo." 
                }), {
                    headers: { "Content-Type": "application/json" },
                    status: 200
                });
            } catch (dbError) {
                return new Response(JSON.stringify({ 
                    error: "Agatha: Error al registrar. ¿El usuario ya existe en 'usuarios'?" 
                }), { 
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }
        }

        // --- LOGIN ---
        if (action === 'login') {
            // Buscamos específicamente en la tabla 'usuarios'
            const user = await env.db.prepare(
                "SELECT * FROM usuarios WHERE username = ? AND password = ?"
            ).bind(username, password).first();

            if (user) {
                return new Response(JSON.stringify({ 
                    message: "Acceso concedido", 
                    user: user.username 
                }), {
                    headers: { "Content-Type": "application/json" },
                    status: 200
                });
            } else {
                return new Response(JSON.stringify({ 
                    error: "Agatha: Identidad no confirmada en la tabla usuarios." 
                }), {
                    headers: { "Content-Type": "application/json" },
                    status: 401
                });
            }
        }

        return new Response(JSON.stringify({ error: "Acción no reconocida." }), { status: 400 });

    } catch (err) {
        return new Response(JSON.stringify({ 
            error: "Fallo crítico: Verifica que la variable 'db' esté vinculada en Cloudflare. " + err.message 
        }), {
            headers: { "Content-Type": "application/json" },
            status: 500
        });
    }
}
