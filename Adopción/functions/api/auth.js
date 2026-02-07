export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { username, password } = await request.json();

    // Usamos la vinculación 'registro' que configuraste
    // Insertamos los datos en la tabla que creamos
    await env.registro.prepare(
      "INSERT INTO usuarios (username, password, fecha) VALUES (?, ?, ?)"
    ).bind(username, password, new Date().toISOString()).run();

    return new Response(JSON.stringify({ message: "Investigador vinculado con éxito" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error de conexión con el núcleo: " + error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
