23:08:18.719 Running build in Washington, D.C., USA (East) – iad1
23:08:18.720 Build machine configuration: 2 cores, 8 GB
23:08:18.828 Cloning github.com/LucaPera-commits/app-ore (Branch: main, Commit: a172baa)
23:08:19.078 Cloning completed: 250.000ms
23:08:19.514 Restored build cache from previous deployment (CNwHHq3frGp4ATuTK63it6XgVxQn)
23:08:19.743 Running "vercel build"
23:08:19.782 Vercel CLI 56.5.0
23:08:19.957 Installing dependencies...
23:08:23.180 
23:08:23.181 up to date in 3s
23:08:23.181 
23:08:23.182 31 packages are looking for funding
23:08:23.182   run `npm fund` for details
23:08:23.212 Detected Next.js version: 14.2.35
23:08:23.216 Running "npm run build"
23:08:23.323 
23:08:23.324 > app-ore@1.0.0 build
23:08:23.324 > next build
23:08:23.324 
23:08:24.054   ▲ Next.js 14.2.35
23:08:24.056 
23:08:24.056    Linting and checking validity of types ...
23:08:24.179    Creating an optimized production build ...
23:08:25.255 Failed to compile.
23:08:25.255 
23:08:25.256 ./pages/index.js
23:08:25.256 Error: 
23:08:25.257   x Expected ';', '}' or <eof>
23:08:25.257    ,-[/vercel/path0/pages/index.js:1:1]
23:08:25.257  1 | 23:04:59.624 Running build in Washington, D.C., USA (East) – iad1
23:08:25.257    : ^|^
23:08:25.257    :  `-- This is the expression part of an expression statement
23:08:25.257  2 | 23:04:59.625 Build machine configuration: 2 cores, 8 GB
23:08:25.257  3 | 23:04:59.715 Cloning github.com/LucaPera-commits/app-ore (Branch: main, Commit: 88fb6ad)
23:08:25.257  4 | 23:05:00.157 Cloning completed: 441.000ms
23:08:25.257    `----
23:08:25.257 
23:08:25.257 Caused by:
23:08:25.258     Syntax Error
23:08:25.258 
23:08:25.258 Import trace for requested module:
23:08:25.258 ./pages/index.js
23:08:25.258 
23:08:25.259 
23:08:25.259 > Build failed because of webpack errors
23:08:25.285 Error: Command "npm run build" exited with 1
