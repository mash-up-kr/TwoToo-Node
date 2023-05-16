# TwoToo Node

## How to use
### Prepare
```
$ npm install @nestjs/cli serverless -g
$ cd ${projectName}
$ npm install
$ npm start
```

### Development
#### use NestCLI

```
$ npm start
```

```
$ npm start
> two-too-node@0.0.1 start
> nest start

[Nest] 3905   - 11/29/2019, 4:40:49 PM   [NestFactory] Starting Nest application...
[Nest] 3905   - 11/29/2019, 4:40:49 PM   [InstanceLoader] AppModule dependencies initialized +20ms
[Nest] 3905   - 11/29/2019, 4:40:49 PM   [RoutesResolver] AppController {/}: +6ms
[Nest] 3905   - 11/29/2019, 4:40:49 PM   [RouterExplorer] Mapped {/, GET} route +3ms
[Nest] 3905   - 11/29/2019, 4:40:49 PM   [NestApplication] Nest application successfully started +4ms
```

Then browse http://localhost:3000

#### use serverless-offline

```bash
$ npm run build && sls offline
```

```
$ sls offline
Serverless: Starting Offline: dev/ap-northeast-2.

Serverless: Routes for index:
Serverless: ANY /
Serverless: ANY /{proxy*}

Serverless: Offline listening on http://localhost:3000
```

Then browse http://localhost:3000

## How to Deploy
```bash
$ npm run build && sls deploy
```

## Options
### Hot start
See : https://serverless.com/blog/keep-your-lambdas-warm/

These behavior can be fixed with the plugin serverless-plugin-warmup

1 Install the plugin

```
$ npm install serverless-plugin-warmup --save-dev
```

2 Enable the plugin

```
plugins:
  - '@hewmen/serverless-plugin-typescript'
  - serverless-plugin-optimize
  - serverless-offline
  - serverless-plugin-warmup

custom:
  # Enable warmup on all functions (only for production and staging)
  warmup:      
      - production
      - staging
```

### Use Swagger for development

```
$ npx ts-node src/swagger.ts
```

```
[Nest] 6890   - 2019-03-24 15:11   [NestFactory] Starting Nest application...
[Nest] 6890   - 2019-03-24 15:11   [InstanceLoader] AppModule dependencies initialized +11ms
[Nest] 6890   - 2019-03-24 15:11   [RoutesResolver] AppController {/}: +224ms
[Nest] 6890   - 2019-03-24 15:11   [RouterExplorer] Mapped {/, GET} route +2ms
[Nest] 6890   - 2019-03-24 15:11   [NestApplication] Nest application successfully started +2ms
```

Then browse http://localhost:3001/api
`
**This function is for development.** If you want to use production, change package.json dependencies and serverless.yml.
