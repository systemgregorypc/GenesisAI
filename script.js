document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log("Sincronizando con el Núcleo...");
    // Aquí va tu fetch a /api/auth
});
