# node-built-in-test

This repo is a study on using the new NodeJs built-in module [node:test](https://nodejs.org/docs/latest-v18.x/api/test.html).

This repo implements a simple HTTP service using Koa. This server has only two endpoints, that efficiently generate a sequence of non-repeatable hexadecimal numbers. The sequence is persisted on disk and successive instantiations of the service continue the sequence from the persisted context.

The codebase was developed in JavaScript, to avoid the need of a building pipeline -- I used JSDoc comments, though, to provide some support when coding. Also, it was a choice not to add any dependency to the project, except from the [Koa](https://koajs.com/) HTTP framework.

## How to run
1. this code requires Node version _18.15.0_ or newer -- verify using `$ node -v`
2. install dependencies using `$ npm ci`
3. run all tests using `$ npm test`
4. start the http server using `$ npm start`
