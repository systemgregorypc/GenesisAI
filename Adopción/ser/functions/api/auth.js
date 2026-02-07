export async function onRequest(context) {
  // Respuesta para la verificación del navegador (CORS)
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
  return onRequestPost(context);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const data = await request.json();
    const { username, email, password, action } = data;

    // Metadatos que Agatha recolecta automáticamente
    const ip = request.headers.get("cf-connecting-ip") || "0.0.0.0";
    const os = request.headers.get("user-agent") || "Desconocido";
    const ciudad = request.cf ? request.cf.city : "Desconocida";
    const pais = request.cf ? request.cf.country : "Desconocido";
    const red = request.cf ? request.cf.asOrganization : "ISP Desconocido";

    // --- MÓDULO DE LOGIN ---
    if (action === 'login') {
      const userRecord = await env.DB.prepare(
        "SELECT * FROM user WHERE username = ? AND password = ?"
      ).bind(username, password).first();

      if (userRecord) {
        return new Response(JSON.stringify({ message: "Acceso Concedido" }), { 
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
      } else {
        return new Response(JSON.stringify({ error: "Credenciales inválidas" }), { status: 401 });
      }
    }

    // --- MÓDULO DE REGISTRO ---
    if (action === 'register') {
      // Verificamos que no falten datos básicos
      if (!username || !email || !password) {
        return new Response(JSON.stringify({ error: "Faltan datos obligatorios" }), { status: 400 });
      }

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

      return new Response(JSON.stringify({ message: "Sincronización Exitosa" }), { 
          status: 200,
          headers: { "Content-Type": "application/json" }
      });
    }

  } catch (error) {
    // Agatha nos dirá exactamente qué tornillo está flojo
    return new Response(JSON.stringify({ error: "Error en el núcleo: " + error.message }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
    });
  }
}
