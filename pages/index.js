22:18:55.515 Running build in Washington, D.C., USA (East) – iad1
22:18:55.516 Build machine configuration: 2 cores, 8 GB
22:18:55.630 Cloning github.com/LucaPera-commits/app-ore (Branch: main, Commit: 5d53461)
22:18:55.909 Cloning completed: 278.000ms
22:18:56.331 Restored build cache from previous deployment (GMuh1qD5KfKHZHX5nFWcPgFy7eKj)
22:18:56.526 Running "vercel build"
22:18:56.591 Vercel CLI 56.5.0
22:18:56.791 Installing dependencies...
22:18:58.882 
22:18:58.883 up to date in 2s
22:18:58.883 
22:18:58.883 31 packages are looking for funding
22:18:58.884   run `npm fund` for details
22:18:58.914 Detected Next.js version: 14.2.35
22:18:58.918 Running "npm run build"
22:18:59.022 
22:18:59.023 > app-ore@1.0.0 build
22:18:59.023 > next build
22:18:59.023 
22:18:59.737   ▲ Next.js 14.2.35
22:18:59.738 
22:18:59.738    Linting and checking validity of types ...
22:18:59.862    Creating an optimized production build ...
22:19:02.611  ✓ Compiled successfully
22:19:02.612    Collecting page data ...
22:19:03.177    Generating static pages (0/4) ...
22:19:03.205 Error: Minified React error #31; visit https://reactjs.org/docs/error-decoder.html?invariant=31&args[]=%5Bobject%20Promise%5D for the full message or use the non-minified dev environment for full errors and additional helpful warnings.
22:19:03.205     at Z (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:490)
22:19:03.205     at Zc (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
22:19:03.206     at Z (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
22:19:03.206     at Zc (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
22:19:03.206     at Z (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
22:19:03.206     at $c (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
22:19:03.206     at bd (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
22:19:03.207     at Z (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
22:19:03.207     at Zc (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
22:19:03.207     at Z (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
22:19:03.207 
22:19:03.207 Error occurred prerendering page "/". Read more: https://nextjs.org/docs/messages/prerender-error
22:19:03.207 
22:19:03.208 Error: Minified React error #31; visit https://reactjs.org/docs/error-decoder.html?invariant=31&args[]=%5Bobject%20Promise%5D for the full message or use the non-minified dev environment for full errors and additional helpful warnings.
22:19:03.208     at Z (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:490)
22:19:03.208     at Zc (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
22:19:03.208     at Z (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
22:19:03.208     at Zc (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
22:19:03.208     at Z (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
22:19:03.208     at $c (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
22:19:03.209     at bd (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
22:19:03.209     at Z (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
22:19:03.209     at Zc (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
22:19:03.209     at Z (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
22:19:03.209 TypeError: t.status is not a function
22:19:03.209     at i (/vercel/path0/.next/server/pages/index.js:1:2229)
22:19:03.209     at Wc (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
22:19:03.210     at Zc (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
22:19:03.210     at Z (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
22:19:03.210     at Zc (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
22:19:03.210     at Z (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
22:19:03.211     at $c (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
22:19:03.211     at bd (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:77:404)
22:19:03.212     at Z (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:217)
22:19:03.212     at Zc (/vercel/path0/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:71:479)
22:19:03.212    Generating static pages (1/4) 
22:19:03.399    Generating static pages (2/4) 
22:19:03.428    Generating static pages (3/4) 
22:19:03.444  ✓ Generating static pages (4/4)
22:19:03.453 
22:19:03.454 > Export encountered errors on following paths:
22:19:03.454 	/
22:19:03.493 Error: Command "npm run build" exited with 1
