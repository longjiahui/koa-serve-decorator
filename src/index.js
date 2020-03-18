const Router = require('koa-router');
const assert = require('assert');
const compose = require('koa-compose');
const Validator = require('validator-biang');
const DecoratorManager = require('decorator-manager');
const jwt = require('jsonwebtoken');
const errno={
    //
    ERR_ARG: 'arg error',
    ERR_NOTOKEN: 'no token, maybe not login',
    ERR_VERIFY_ERROR: 'verify error',

    //
    ERR_GETTOKEN_ERROR: '[system] get token function must be set',
    ERR_GETJWTSECRET_ERROR: '[system] jwtsecret must be set',
}
const err = {
    ERR_ARG: (msg)=>({
        code: errno.ERR_ARG,
        msg
    }),
    ERR_NOTOKEN: {
        code: errno.ERR_NOTOKEN,
        msg: errno.ERR_NOTOKEN
    },
    ERR_VERIFY_ERROR: msg=>({
        code: errno.ERR_VERIFY_ERROR,
        msg,
    })
}

let manager = new DecoratorManager();

manager.register('route');
manager.register('params');
manager.register('queries');
manager.register('loginCheck', {hasArgs: false});

/**
 * 
 * @param {*} options    getToken(ctx)  jwtSecret base
 */
function routeAll(options){
    if(!options){
        options = {};
    }
    let routers = [];
    manager._forEachConfigs(manager.configs, (config, targetId)=>{
        const method = 1;
        const path = 0;
        let target = manager.getTarget(targetId);
        let baseRoute = config.route;
        let baseLoginCheck = config.loginCheck;
        let router = new Router();
        manager._forEachConfigs(config[manager.methodConfigsKey], (methodConfig, name)=>{
            let {params, queries, route, loginCheck} = methodConfig;
            let middlewares = [];
            if(loginCheck || baseLoginCheck){
                middlewares.push(dealLoginCheck(options))
            }
            if(params){
                middlewares.push(dealParams(params[0]));
            }
            if(queries){
                middlewares.push(dealQueries(queries[0]));
            }
            if(route){
                if(!route[method]){
                    route[method] = baseRoute[method];
                }
                assert(route[method], 'router\'s method must not be empty');
                middlewares.push(target[name]); 
                router[route[method]](route[path], compose(middlewares));
            }
        });
        if(baseRoute[path] && baseRoute[path] !== '/'){
            router = (new Router()).use(baseRoute[path], router.routes());
        }
        routers.push(router.routes());
    })
    let ret = compose(routers);
    if(options.base){
        let newRouters = [];
        routers.forEach(router=>{
            newRouters.push(new Router().use(options.base, router).routes());
        });
        ret = compose(newRouters);
    }
    return ret;
}

function dealParams(rule){
    return async (ctx, next)=>{
        try{
           await (new Validator().validate(ctx.request.body, rule));
        }catch(error){
            throw err.ERR_ARG(error);            
        }
        await next();
    }
}

function dealQueries(rule){
    return async (ctx, next)=>{
        try{
            await (new Validator().validate(ctx.query, rule));
        }catch(error){
            throw err.ERR_ARG(error);        
        }
        await next();
    }
}

function dealLoginCheck(options){
    return async (ctx, next)=>{
        if(!options.getToken){
            throw err.ERR_GETTOKEN_ERROR;
        }
        let token = options.getToken(ctx);
        if(!token){
            throw err.ERR_NOTOKEN;
        }else{
            let decoded = '';
            if(!options.jwtSecret){
                throw err.ERR_GETJWTSECRET_ERROR;
            }
            try{
                decoded = jwt.verify(token, options.jwtSecret);
                ctx.request.user = decoded.data;
            }catch(error){
                throw err.ERR_VERIFY_ERROR(error);
            }
            await next();
        }
    }
}

module.exports = {
    ...manager.decorators,
    routeAll,
    errno,
    DecoratorManager
}
