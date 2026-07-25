22:21:53.529 Running build in Washington, D.C., USA (East) – iad1
22:21:53.530 Build machine configuration: 2 cores, 8 GB
22:21:53.655 Cloning github.com/LucaPera-commits/app-ore (Branch: main, Commit: 99589c8)
22:21:53.957 Cloning completed: 302.000ms
22:21:54.299 Restored build cache from previous deployment (GMuh1qD5KfKHZHX5nFWcPgFy7eKj)
22:21:54.502 Running "vercel build"
22:21:54.520 Vercel CLI 56.5.0
22:21:54.686 Installing dependencies...
22:21:56.831 
22:21:56.831 up to date in 2s
22:21:56.832 
22:21:56.832 31 packages are looking for funding
22:21:56.832   run `npm fund` for details
22:21:56.863 Detected Next.js version: 14.2.35
22:21:56.867 Running "npm run build"
22:21:57.040 
22:21:57.041 > app-ore@1.0.0 build
22:21:57.041 > next build
22:21:57.041 
22:21:57.767   ▲ Next.js 14.2.35
22:21:57.768 
22:21:57.769    Linting and checking validity of types ...
22:21:57.902    Creating an optimized production build ...
22:21:58.927 Failed to compile.
22:21:58.928 
22:21:58.928 ./pages/index.js
22:21:58.928 Error: 
22:21:58.928   x Expected ';', '}' or <eof>
22:21:58.928    ,-[/vercel/path0/pages/index.js:1:1]
22:21:58.928  1 | 22:18:55.515 Running build in Washington, D.C., USA (East) – iad1
22:21:58.928    : ^|^
22:21:58.929    :  `-- This is the expression part of an expression statement
22:21:58.929  2 | 22:18:55.516 Build machine configuration: 2 cores, 8 GB
22:21:58.929  3 | 22:18:55.630 Cloning github.com/LucaPera-commits/app-ore (Branch: main, Commit: 5d53461)
22:21:58.929  4 | 22:18:55.909 Cloning completed: 278.000ms
22:21:58.929    `----
22:21:58.929 
22:21:58.929 Caused by:
22:21:58.929     Syntax Error
22:21:58.931 
22:21:58.931 Import trace for requested module:
22:21:58.931 ./pages/index.js
22:21:58.932 
22:21:58.933 
22:21:58.933 > Build failed because of webpack errors
22:21:58.961 Error: Command "npm run build" exited with 1
