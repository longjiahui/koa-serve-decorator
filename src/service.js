const DecoratorManager = require('decorator-manager');
const assert = require('assert');

let manager = new DecoratorManager();
manager.register('service', {hasArgs: false});

function serviceAll(){
    return async (ctx, next)=>{
        manager.forEach((target, config)=>{
            if(config.service){
                let key = target.constructor.name;
                key = key[0].toLowerCase() + key.substr(1);
                assert(ctx[key] === undefined, `class name[${key}] has already been used`);
                ctx[key] = new target.constructor();
                //注入ctx
                ctx[key].ctx = ctx;
            }
        });
        await next();
    }
}

module.exports = {
    ...manager.decorators,
    serviceAll
}