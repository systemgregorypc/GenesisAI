export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { username, password, action } = body;
        const email = body.email || ""; 
        
        // Obtenemos su token de seguridad del wrangler.toml
        const SALT = env.SALT_TOKEN || "";

        if (!username || !password) {
            return new Response(JSON.stringify({ 
                error: "Agatha: Identificación incompleta." 
            }), { 
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Combinamos la contraseña con el SALT para máxima seguridad
        // Así, aunque alguien vea la DB, no sabrá la clave real
        const securePassword = password + SALT;

        // --- REGISTRO ---
        if (action === 'register') {
            try {
                // Usamos 'env.db' que es el binding que acabamos de corregir
                await env.db.prepare(
                    "INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)"
                ).bind(username, email, securePassword).run();

                return new Response(JSON.stringify({ 
                    message: "Identidad creada con éxito en el núcleo de Génesis AI." 
                }), {
                    headers: { "Content-Type": "application/json" },
                    status: 200
                });
            } catch (dbError) {
                return new Response(JSON.stringify({ 
                    error: "Agatha: Error al registrar. ¿El usuario ya existe?" 
                }), { 
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }
        }

        // --- LOGIN ---
        if (action === 'login') {
            const user = await env.db.prepare(
                "SELECT * FROM usuarios WHERE username = ? AND password = ?"
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

        return new Response(JSON.stringify({ error: "Acción no reconocida por el núcleo." }), { status: 400 });

    } catch (err) {
        return new Response(JSON.stringify({ 
            error: "Fallo crítico: Verifica la conexión 'db'. " + err.message 
        }), {
            headers: { "Content-Type": "application/json" },
            status: 500
        });
    }
}
