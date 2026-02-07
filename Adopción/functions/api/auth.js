export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const data = await request.json();
    const { username, email, password, action } = data;

    // Datos técnicos automáticos
    const ip = request.headers.get("cf-connecting-ip") || "Desconocida";
    const os = request.headers.get("user-agent") || "Desconocido";
    const ciudad = request.cf ? request.cf.city : "Desconocida";
    const pais = request.cf ? request.cf.country : "Desconocido";
    const red = request.cf ? request.cf.asOrganization : "ISP Desconocido";

    // NOTA: Usamos 'env.DB' porque es el estándar de Cloudflare
    
    // --- LÓGICA DE LOGIN ---
    if (action === 'login') {
      const userRecord = await env.DB.prepare(
        "SELECT * FROM user WHERE username = ? AND password = ?"
      ).bind(username, password).first();

      if (userRecord) {
        return new Response(JSON.stringify({ message: "Acceso OK" }), { status: 200 });
      } else {
        return new Response(JSON.stringify({ error: "Credenciales no encontradas" }), { status: 401 });
      }
    }

    // --- LÓGICA DE REGISTRO ---
    if (action === 'register') {
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

      return new Response(JSON.stringify({ message: "Registro exitoso" }), { status: 200 });
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: "Fallo en el núcleo: " + error.message }), { status: 500 });
  }
}
