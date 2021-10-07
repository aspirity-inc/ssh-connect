pwd
id


npm list --depth=0

npm list --depth=0 | grep --silent esbuild-nodemon \
  || (echo install esbuild-nodemon && npm install --no-audit --silent --no-save esbuild-nodemon)

echo npm install
npm install

exec esbuild-nodemon src/server.ts
