export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // Leemos los datos enviados desde el formulario (registrar.html o login.html)
        const body = await request.json();
        const { username, email, password, action } = body;

        // 1. LÓGICA PARA EL REGISTRO
        if (action === 'register') {
            if (!username || !email || !password) {
                return new Response(JSON.stringify({ error: "Faltan datos obligatorios" }), { status: 400 });
            }

            // Insertamos el nuevo usuario en la tabla 'usuarios' de tu DB
            await env.DB.prepare(
                "INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)"
            ).bind(username, email, password).run();

            return new Response(JSON.stringify({ message: "Usuario registrado con éxito en Génesis AI" }), {
                headers: { "Content-Type": "application/json" },
                status: 200
            });
        }

        // 2. LÓGICA PARA EL INICIO DE SESIÓN (LOGIN)
        if (action === 'login') {
            const user = await env.DB.prepare(
                "SELECT * FROM usuarios WHERE username = ? AND password = ?"
            ).bind(username, password).first();

            if (user) {
                return new Response(JSON.stringify({ 
                    message: "Acceso concedido", 
                    usuario: user.username 
                }), {
                    headers: { "Content-Type": "application/json" },
                    status: 200
                });
            } else {
                return new Response(JSON.stringify({ error: "Usuario o contraseña incorrectos" }), {
                    headers: { "Content-Type": "application/json" },
                    status: 401
                });
            }
        }

        return new Response(JSON.stringify({ error: "Acción no permitida" }), { status: 400 });

    } catch (err) {
        // Si hay un error de conexión o de base de datos
        return new Response(JSON.stringify({ 
            error: "Error en el núcleo Agatha: " + err.message 
        }), {
            headers: { "Content-Type": "application/json" },
            status: 500
        });
    }
}
