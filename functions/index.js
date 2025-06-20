const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.renderSecurePage = functions.https.onRequest(async (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : null;

  if (!token) {
    return res.status(401).send("Brak tokena ID. Zaloguj się.");
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    const html = `
      <!DOCTYPE html>
      <html lang="pl">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Strefa chroniona</title>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <div class="container">
          <header><h1>Witaj, ${decoded.email}</h1></header>
          <main>
            <p>To jest zabezpieczona strona tylko dla zalogowanych użytkowników.</p>
            <button onclick="logout()">Wyloguj</button>
          </main>
          <footer><p>© 2025 Moja PWA</p></footer>
        </div>
        <script>
          function logout() {
            localStorage.removeItem('idToken');
            location.href = "/login.html";
          }
        </script>
      </body>
      </html>
    `;

    res.status(200).send(html);
  } catch (err) {
    console.error("Błąd weryfikacji tokena:", err);
    res.status(403).send("Dostęp zabroniony. Brak prawidłowego tokena.");
  }
});
