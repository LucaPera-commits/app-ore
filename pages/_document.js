import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="it">
      <Head>
        {/* Carica la grafica di Tailwind CSS in automatico */}
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      <body className="bg-slate-100 text-slate-800">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
