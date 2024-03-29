############   prod_dependencies   ############
FROM node:16.10.0-alpine3.14 as prod_dependencies

RUN apk add dumb-init

ENV NODE_ENV production
WORKDIR /app
COPY package.json package-lock.json ./

# We don't need NPM cache in final image
RUN npm ci --no-audit \
  && npm cache clean --force


############   build   ############
FROM prod_dependencies as build
ENV NODE_ENV development

# install devDependencies too
RUN npm ci --no-audit
COPY ./ ./
RUN npm run build


############   final   ############
FROM prod_dependencies
COPY --from=build /app/dist ./
# Snyc recomends to use dumb-init
# https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/#:~:text=One%20such%20tool%20that%20we%20use%20at%20Snyk%20is%20dumb-init
CMD ["dumb-init", "node", "ssh-connect.js"]
