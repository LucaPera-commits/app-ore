import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="it">
      <Head>
        {/* Caricamento globale di Tailwind CSS e dei font professionali */}
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <body className="bg-slate-100 text-slate-800 font-sans antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
