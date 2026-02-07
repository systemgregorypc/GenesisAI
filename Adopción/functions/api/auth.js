export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const data = await request.json();
    const { username, email, password, action } = data;

    // Datos técnicos automáticos de Cloudflare
    const ip = request.headers.get("cf-connecting-ip") || "Desconocida";
    const os = request.headers.get("user-agent") || "Desconocido";
    const ciudad = request.cf ? request.cf.city : "Desconocida";
    const pais = request.cf ? request.cf.country : "Desconocido";
    const red = request.cf ? request.cf.asOrganization : "ISP Desconocido";

    // Nota: Usamos 'env.DB' y la tabla 'user' porque así está en tu Cloudflare
    
    // 1. LÓGICA DE LOGIN
    if (action === 'login') {
      const userRecord = await env.DB.prepare(
        "SELECT * FROM user WHERE username = ? AND password = ?"
      ).bind(username, password).first();

      if (userRecord) {
        return new Response(JSON.stringify({ message: "Acceso Concedido" }), { status: 200 });
      } else {
        return new Response(JSON.stringify({ error: "Credenciales inválidas" }), { status: 401 });
      }
    }

    // 2. LÓGICA DE REGISTRO
    if (!username || !email || !password) {
      return new Response(JSON.stringify({ error: "Datos incompletos" }), { status: 400 });
    }

    // Insertar en la tabla 'user' (en singular)
    await env.DB.prepare(
      "INSERT INTO user (username, email, password, fecha, ip, sistema, ubicacion, red) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      username, 
      email, 
      password, 
      new Date().toISOString(), 
      ip, 
      os, 
      `${ciudad}, ${pais}`, 
      red
    ).run();

    return new Response(JSON.stringify({ message: "Investigador Sincronizado" }), { status: 200 });

  } catch (error) {
    // Si sale error aquí, Agatha te dirá exactamente por qué
    return new Response(JSON.stringify({ error: "Error en el nodo: " + error.message }), { status: 500 });
  }
}
