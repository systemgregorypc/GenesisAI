export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { username, email, password, action } = body;

        // 1. REGISTRO
        if (action === 'register') {
            // Aquí conectamos con tu base de datos D1
            await env.DB.prepare(
                "INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)"
            ).bind(username, email, password).run();

            return new Response(JSON.stringify({ message: "Usuario registrado con éxito" }), {
                headers: { "Content-Type": "application/json" },
                status: 200
            });
        }

        // 2. LOGIN
        if (action === 'login') {
            const user = await env.DB.prepare(
                "SELECT * FROM usuarios WHERE username = ? AND password = ?"
            ).bind(username, password).first();

            if (user) {
                return new Response(JSON.stringify({ message: "Acceso concedido", user: user.username }), {
                    headers: { "Content-Type": "application/json" },
                    status: 200
                });
            } else {
                return new Response(JSON.stringify({ error: "Credenciales inválidas" }), {
                    headers: { "Content-Type": "application/json" },
                    status: 401
                });
            }
        }

    } catch (err) {
        return new Response(JSON.stringify({ error: "Error interno del núcleo: " + err.message }), {
            headers: { "Content-Type": "application/json" },
            status: 500
        });
    }
}

//
