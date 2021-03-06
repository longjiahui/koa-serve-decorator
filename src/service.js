const DecoratorManager = require('@anfo/decorator-manager');
const assert = require('assert');

let manager = new DecoratorManager();
manager.register('service', {hasArgs: false});
// indicating the method will call before route
manager.register('beforeRoute', {hasArgs: false});
manager.register('afterRoute', {hasArgs: false});

function serviceAll(){
    /**
     * {
     *  key: {
     *      service:{},
     *      beforeRoutes:[]
     *  }
     * }
     */    
    let services = {};
    let _ctx = null;
    manager.forEach((target, config)=>{
        if(config.service){
            let key = target.constructor.name;
            key = key[0].toLowerCase() + key.substr(1);
            assert(services[key] === undefined, `class name[${target.constructor.name}] has already been used by another service`);
            let service = new target.constructor();
            Object.defineProperty(service, 'ctx', {
                get(){
                    return _ctx;
                }
            });
            services[key] = {
                service,
                beforeRoutes: [],
                afterRoutes: [],
            };
            manager._forEachConfigs(config[manager.methodConfigsKey], (methodConfig, name)=>{
                if(methodConfig.beforeRoute){
                    services[key].beforeRoutes.push(service[name]);
                }
                if(methodConfig.afterRoute){
                    services[key].afterRoutes.push(service[name]);
                }
            });
        }
    });
    return async (ctx, next)=>{
        _ctx = ctx;
        for(let key in services){
            if(services.hasOwnProperty(key)){
                let {service, beforeRoutes} = services[key];
                for(let i = 0; i< beforeRoutes.length; ++i){
                    let beforeRoute = beforeRoutes[i];
                    beforeRoute.call(service);
                }
                // call next
                assert(ctx[key] === undefined, `service instance name[${key}] has already been used in ctx`);
                ctx[key] = service;
            }
        }
        await next();
        for(let key in services){
            if(services.hasOwnProperty(key)){
                let {service, afterRoutes} = services[key];
                for(let i = 0; i < afterRoutes.length; ++i){
                    let afterRoute = afterRoutes[i];
                    afterRoute.call(service);
                }
            }
        }
    }
}

module.exports = {
    ...manager.decorators,
    serviceAll
}