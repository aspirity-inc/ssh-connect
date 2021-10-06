pwd
id
npm list -g --depth=0

npm list -g --depth=0 | grep --silent esbuild-nodemon \
  || (echo install esbuild-nodemon && npm install --global esbuild-nodemon)

echo npm install
npm install

exec esbuild-nodemon src/server.ts
