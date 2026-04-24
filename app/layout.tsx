import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "Agustina",
  description: "Asistente virtual",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}

        {/* 👉 CARGA CORRECTA DE LA BURBUJA */}
        <Script src="/bubble.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}