export async function onRequest(context) {
  // Si es una petición de control (OPTIONS), respondemos OK de inmediato
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
  // ... (aquí sigue todo el resto de tu código igual)
