import Script from "next/script";

export default function PruebaBurbuja() {
  return (
    <main style={{ fontFamily: "Arial, sans-serif", padding: "28px", maxWidth: 760, margin: "auto" }}>
      <h1>Prueba independiente de Agustina Web</h1>
      <p>Esta página permite probar la burbuja de chat. Solo usar una dirección de Vercel Preview.</p>
      <p>Hacé clic en la burbuja negra de la esquina inferior derecha. Escribí <strong>quiero cotizar</strong> y completá datos ficticios.</p>
      <p>El resultado esperado es: <strong>PRUEBA: prospecto simulado</strong>, sin registrar prospectos ni enviar correos.</p>
      <Script src="/bubble.js" strategy="afterInteractive" />
    </main>
  );
}
