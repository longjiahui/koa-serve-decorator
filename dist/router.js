const Router = require('koa-router');

const assert = require('assert');

const compose = require('koa-compose');

const Validator = require('validator-biang');

const DecoratorManager = require('decorator-manager');

const jwt = require('jsonwebtoken');

const errno = {
  //
  ERR_ARG: 'arg error',
  ERR_NOTOKEN: 'no token, maybe not login',
  ERR_VERIFY_ERROR: 'verify error',
  //
  ERR_GETTOKEN_ERROR: '[system] get token function must be set',
  ERR_GETJWTSECRET_ERROR: '[system] jwtsecret must be set'
};
const err = {
  ERR_ARG: msg => ({
    code: errno.ERR_ARG,
    msg
  }),
  ERR_NOTOKEN: {
    code: errno.ERR_NOTOKEN,
    msg: errno.ERR_NOTOKEN
  },
  ERR_VERIFY_ERROR: msg => ({
    code: errno.ERR_VERIFY_ERROR,
    msg
  })
};
let manager = new DecoratorManager();
manager.register('route');
manager.register('param');
manager.register('query');
manager.register('loginCheck', {
  hasArgs: false
});
/**
 * 
 * @param {*} options    getToken(ctx)  jwtSecret base
 */

function routeAll(options) {
  if (!options) {
    options = {};
  }

  const {
    0: rootPath,
    1: rootMethod
  } = options.base ? options.base : {};
  let routers = [];

  manager._forEachConfigs(manager.configs, (config, targetId) => {
    const methodIndex = 1;
    const pathIndex = 0;
    let target = manager.getTarget(targetId);
    let baseRoute = config.route;
    let baseLoginCheck = config.loginCheck;
    let router = new Router();

    manager._forEachConfigs(config[manager.methodConfigsKey], (methodConfig, name) => {
      let {
        param,
        query,
        route,
        loginCheck
      } = methodConfig;
      let middlewares = [];

      if (loginCheck || baseLoginCheck) {
        middlewares.push(dealLoginCheck(options));
      }

      if (param) {
        middlewares.push(dealParam(param[0]));
      }

      if (query) {
        middlewares.push(dealQuery(query[0]));
      }

      if (route) {
        let method = route[methodIndex];

        if (!method) {
          if (baseRoute[methodIndex]) {
            method = baseRoute[methodIndex];
          } else {
            method = rootMethod;
          }
        }

        assert(method, 'router\'s method must not be empty');
        middlewares.push(target[name]);
        console.log(method, route[pathIndex], rootPath);
        router[method](route[pathIndex], compose(middlewares));
      }
    });

    if (baseRoute[pathIndex] && baseRoute[pathIndex] !== '/') {
      router = new Router().use(route[pathIndex], router.routes());
    }

    routers.push(router.routes());
  });

  let ret = compose(routers);

  if (rootPath && rootPath !== '/') {
    let rootRouter = new Router();
    routers.forEach(router => {
      rootRouter.use(rootPath, router).routes();
    });
    ret = rootRouter.routes();
  }

  return ret;
}

function dealParam(rule) {
  return async (ctx, next) => {
    try {
      let param = {};
      Object.assign(param, ctx.params);
      Object.assign(param, ctx.request.body);
      await new Validator().validate(param, rule);
    } catch (error) {
      throw err.ERR_ARG(error);
    }

    await next();
  };
}

function dealQuery(rule) {
  return async (ctx, next) => {
    try {
      await new Validator().validate(ctx.query, rule);
    } catch (error) {
      throw err.ERR_ARG(error);
    }

    await next();
  };
}

function dealLoginCheck(options) {
  return async (ctx, next) => {
    if (!options.getToken) {
      throw err.ERR_GETTOKEN_ERROR;
    }

    let token = options.getToken(ctx);

    if (!token) {
      throw err.ERR_NOTOKEN;
    } else {
      let decoded = '';

      if (!options.jwtSecret) {
        throw err.ERR_GETJWTSECRET_ERROR;
      }

      try {
        decoded = jwt.verify(token, options.jwtSecret);
        ctx.request.user = decoded.data;
      } catch (error) {
        throw err.ERR_VERIFY_ERROR(error);
      }

      await next();
    }
  };
}

module.exports = { ...manager.decorators,
  routeAll,
  errno,
  DecoratorManager
};