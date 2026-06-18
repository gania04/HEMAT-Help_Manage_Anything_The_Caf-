import { NextResponse } from 'next/server';

export async function GET() {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Membersihkan Sistem</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #00875A; color: white; margin: 0; }
          .spinner { border: 4px solid rgba(255,255,255,0.3); border-radius: 50%; border-top: 4px solid white; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 20px; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="spinner"></div>
        <h2>Memperbaiki Sistem...</h2>
        <p>Mohon tunggu sebentar.</p>
        <script>
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(regs) {
              for (const reg of regs) {
                reg.unregister();
              }
              // Hapus semua cache terkait PWA
              caches.keys().then(function(names) {
                for (const name of names) {
                  caches.delete(name);
                }
                // Redirect kembali ke login setelah dibersihkan
                setTimeout(() => {
                  window.location.href = '/login';
                }, 1000);
              });
            }).catch(function() {
               window.location.href = '/login';
            });
          } else {
            window.location.href = '/login';
          }
        </script>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Clear-Site-Data': '"cache", "cookies", "storage"'
    },
  });
}
