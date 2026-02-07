export async function onRequest(context) {

  // Soporte para CORS (evita bloqueos del navegador)

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



    // Recolección de datos técnicos por Agatha

    const ip = request.headers.get("cf-connecting-ip") || "0.0.0.0";

    const os = request.headers.get("user-agent") || "Desconocido";

    const ciudad = request.cf ? request.cf.city : "Desconocida";

    const pais = request.cf ? request.cf.country : "Desconocido";

    const red = request.cf ? request.cf.asOrganization : "ISP Desconocido";



    // --- MÓDULO DE LOGIN ---

    if (action === 'login') {

      // Usamos env.db en minúsculas como configuraste

      const userRecord = await env.db.prepare(

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

      if (!username || !email || !password) {

        return new Response(JSON.stringify({ error: "Faltan datos" }), { status: 400 });

      }



      // Insertar en la tabla 'user' que creaste anoche

      await env.db.prepare(

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

    // Si algo falla, Agatha te dirá si es la tabla o el código

    return new Response(JSON.stringify({ error: "Fallo en el núcleo: " + error.message }), { 

        status: 500,

        headers: { "Content-Type": "application/json" }

    });

  }

}
