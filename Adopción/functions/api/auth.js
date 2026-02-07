export async function onRequestPost(context) {
  const { env, request } = context;
  const db = env.db; // Aquí es donde se conecta con tu base de datos D1

  try {
    const { username, password, email, action } = await request.json();

    if (action === 'register') {
      // Lógica de Registro
      await db.prepare("INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)")
        .bind(username, email, password)
        .run();
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } 

    if (action === 'login') {
      // Lógica de Login
      const user = await db.prepare("SELECT * FROM usuarios WHERE username = ? AND password = ?")
        .bind(username, password)
        .first();

      if (user) {
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      } else {
        return new Response(JSON.stringify({ error: "Credenciales inválidas" }), { status: 401 });
      }
    }

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
