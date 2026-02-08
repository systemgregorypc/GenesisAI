export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // 1. Recepción de datos desde el formulario (login o registro)
        const body = await request.json();
        const { username, password, action } = body;
        
        // El email es opcional (se usa en registro pero no en login)
        const email = body.email || ""; 

        // 2. Validación de campos obligatorios
        if (!username || !password) {
            return new Response(JSON.stringify({ 
                error: "Agatha: Identificación incompleta. Se requiere usuario y clave." 
            }), { 
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // --- MÓDULO DE REGISTRO ---
        if (action === 'register') {
            try {
                // Insertamos el nuevo investigador en la tabla 'usuarios'
                await env.DB.prepare(
                    "INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)"
                ).bind(username, email, password).run();

                return new Response(JSON.stringify({ 
                    message: "Identidad creada con éxito. Agatha ha guardado tus datos." 
                }), {
                    headers: { "Content-Type": "application/json" },
                    status: 200
                });
            } catch (dbError) {
                // Manejo de error si el nombre de usuario ya existe (UNIQUE constraint)
                return new Response(JSON.stringify({ 
                    error: "Agatha: Este nombre de usuario ya está reservado o el núcleo está ocupado." 
                }), { 
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }
        }

        // --- MÓDULO DE LOGIN ---
        if (action === 'login') {
            // Buscamos al usuario en la base de datos D1
            const user = await env.DB.prepare(
                "SELECT * FROM usuarios WHERE username = ? AND password = ?"
            ).bind(username, password).first();

            if (user) {
                // Éxito: Agatha reconoce la identidad
                return new Response(JSON.stringify({ 
                    message: "Acceso concedido", 
                    user: user.username 
                }), {
                    headers: { "Content-Type": "application/json" },
                    status: 200
                });
            } else {
                // Error: Credenciales incorrectas
                return new Response(JSON.stringify({ 
                    error: "Agatha: Identidad no confirmada. Acceso denegado." 
                }), {
                    headers: { "Content-Type": "application/json" },
                    status: 401
                });
            }
        }

        // Si no se especifica una acción válida
        return new Response(JSON.stringify({ error: "Comando no reconocido por el núcleo." }), { 
            status: 400,
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        // Captura de errores críticos (por ejemplo, si env.DB no está configurado)
        return new Response(JSON.stringify({ 
            error: "Fallo crítico en el sistema Agatha: " + err.message 
        }), {
            headers: { "Content-Type": "application/json" },
            status: 500
        });
    }
}
