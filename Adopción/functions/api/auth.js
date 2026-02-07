export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const data = await request.json();
    const { username, email, password, action } = data;

    // 1. Lógica de LOGIN (Si el usuario intenta entrar)
    if (action === 'login') {
      const user = await env.registro.prepare(
        "SELECT * FROM usuarios WHERE username = ? AND password = ?"
      ).bind(username, password).first();

      if (user) {
        return new Response(JSON.stringify({ message: "Bienvenido" }), { status: 200 });
      } else {
        return new Response(JSON.stringify({ error: "Credenciales incorrectas" }), { status: 401 });
      }
    }

    // 2. Lógica de REGISTRO (Si el botón es Registrar)
    // Validaciones que tenías en server.html
    if (!username || !email || !password) {
      return new Response(JSON.stringify({ error: "Todos los campos son obligatorios" }), { status: 400 });
    }

    // Insertar en la base de datos D1
    await env.registro.prepare(
      "INSERT INTO usuarios (username, email, password, fecha) VALUES (?, ?, ?, ?)"
    ).bind(username, email, password, new Date().toISOString()).run();

    return new Response(JSON.stringify({ message: "Usuario registrado con éxito" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Error en el nodo: " + error.message }), {
      status: 500
    });
  }
}
