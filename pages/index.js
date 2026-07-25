23:04:59.624 Running build in Washington, D.C., USA (East) – iad1
23:04:59.625 Build machine configuration: 2 cores, 8 GB
23:04:59.715 Cloning github.com/LucaPera-commits/app-ore (Branch: main, Commit: 88fb6ad)
23:05:00.157 Cloning completed: 441.000ms
23:05:00.337 Restored build cache from previous deployment (CNwHHq3frGp4ATuTK63it6XgVxQn)
23:05:00.502 Running "vercel build"
23:05:00.525 Vercel CLI 56.5.0
23:05:00.676 Installing dependencies...
23:05:02.703 
23:05:02.704 up to date in 2s
23:05:02.704 
23:05:02.704 31 packages are looking for funding
23:05:02.704   run `npm fund` for details
23:05:02.731 Detected Next.js version: 14.2.35
23:05:02.735 Running "npm run build"
23:05:02.831 
23:05:02.831 > app-ore@1.0.0 build
23:05:02.832 > next build
23:05:02.832 
23:05:03.494   ▲ Next.js 14.2.35
23:05:03.494 
23:05:03.495    Linting and checking validity of types ...
23:05:03.602    Creating an optimized production build ...
23:05:04.543 Failed to compile.
23:05:04.544 
23:05:04.544 ./pages/index.js
23:05:04.545 Error: 
23:05:04.545   x Expected ';', '}' or <eof>
23:05:04.545    ,-[/vercel/path0/pages/index.js:1:1]
23:05:04.545  1 | 23:00:59.100 Running build in Washington, D.C., USA (East) – iad1
23:05:04.546    : ^|^
23:05:04.546    :  `-- This is the expression part of an expression statement
23:05:04.546  2 | 23:00:59.101 Build machine configuration: 2 cores, 8 GB
23:05:04.548  3 | 23:00:59.207 Cloning github.com/LucaPera-commits/app-ore (Branch: main, Commit: 668c864)
23:05:04.548  4 | 23:00:59.564 Cloning completed: 356.000ms
23:05:04.548    `----
23:05:04.548 
23:05:04.548 Caused by:
23:05:04.548     Syntax Error
23:05:04.548 
23:05:04.548 Import trace for requested module:
23:05:04.548 ./pages/index.js
23:05:04.549 
23:05:04.549 
23:05:04.549 > Build failed because of webpack errors
23:05:04.574 Error: Command "npm run build" exited with 1
