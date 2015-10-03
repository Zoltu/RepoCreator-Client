## Build (only required once on checkout)

[![Join the chat at https://gitter.im/Zoltu/RepoCreator-Client](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/Zoltu/RepoCreator-Client?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
```
npm install
node_modules/.bin/jspm registry config github
node_modules/.bin/jspm config registries.bower.handler jspm-bower-endpoint
node_modules/.bin/jspm install
```

## Run
```
npm start
```

## Develop
Once the application is running you can make changes and see them when you refresh the browser.  Be aware, the page is setup to cache locally so you may need to do a hard reload as described here: https://www.getfilecloud.com/blog/2015/03/tech-tip-how-to-do-hard-refresh-in-browsers

## Maintain

### Install or Update NPM package
```
npm install --save-dev <package-name>
```

### Install or Update JSPM package
```
node_modules/.bin/jspm install <package-name>
```

### Update Runtime Transpiler
```
node_modules/.bin/jspm dl-loader --latest
```

### Update Runtime Transpiler to vnext (until [npm tag support](https://github.com/jspm/npm/issues/61) is added to JSPM)
> TODO: Test if this actually works.

```
npm dist-tag ls typescript
node_modules/.bin/jspm install --dev typescript@<next-version-from-first-command-result>
```

### Update Aurelia
> Note: Verify that this list of dependencies is all that is used by searching through the project for `import.*from .aurelia-.*`

```
node_modules/.bin/jspm install aurelia-bootstrapper aurelia-dependency-injection aurelia-event-aggregator aurelia-router aurelia-templating aurelia-binding aurelia-http-client aurelia-computed
```
