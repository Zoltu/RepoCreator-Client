FROM zoltu/aspnetcore-gulp-bower

ARG JSPM_GITHUB_AUTH_TOKEN

COPY package.json /app/package.json
COPY client/jspm-config.js /app/client/jspm-config.js
WORKDIR /app
RUN npm install
RUN node_modules/.bin/jspm config registries.bower.handler jspm-bower-endpoint
RUN node_modules/.bin/jspm config registries.bower.timeouts.lookup 300
RUN node_modules/.bin/jspm config registries.bower.timeouts.build 300
RUN node_modules/.bin/jspm config registries.github.timeouts.lookup 300
RUN node_modules/.bin/jspm config registries.github.timeouts.build 300
RUN node_modules/.bin/jspm config registries.github.auth $JSPM_GITHUB_AUTH_TOKEN
RUN node_modules/.bin/jspm config registries.npm.timeouts.lookup 300
RUN node_modules/.bin/jspm config registries.npm.timeouts.build 300
RUN node_modules/.bin/jspm install

COPY Startup.cs /app/
COPY project.json /app/
COPY project.lock.json /app/

RUN dotnet restore
RUN dotnet build

COPY client /app/client
RUN node_modules/.bin/jspm bundle source/**/* + aurelia-bootstrapper + aurelia-computed + aurelia-animator-css + aurelia-dialog + npm:aurelia-loader-default@1.0.0-beta.1.2.0 + npm:aurelia-framework@1.0.0-beta.1.2.0 + npm:aurelia-logging-console@1.0.0-beta.1.2.0 + npm:aurelia-templating-binding@1.0.0-beta.1.2.0 + npm:aurelia-templating-resources@1.0.0-beta.1.2.0 + npm:aurelia-history-browser@1.0.0-beta.1.2.0 + npm:aurelia-templating-router@1.0.0-beta.1.2.0 - source/services/OAuth-OAuthIo --minify

EXPOSE 80

ENTRYPOINT ["dotnet", "run"]
