const Koa = require('koa');
const koaBody = require('koa-body');
const {route, param, query, routeAll, service, serviceAll, initAll, beforeRoute, afterRoute} = require('../index');

@route('/', 'get')
class A{
    @query({
        a: /test/
    })
    @param({
        'b?': /test/,
        'c?': val=>val.length > 3
    })
    @route('/abc')
    async test(ctx, next){
        ctx.aService.a();
        console.log('lala');
        ctx.body = ctx.aService.a();
        await next();
    }

    @query({
        b: /test/
    })
    @route('/apid')
    async test2(ctx){
        console.log('lala');
        ctx.body = {
            hello: '2'
        }
        await next();
    }
}

@service
class AService{
    constructor(){
        this.count = 0;
    }
    a(){
        return this.count;
    }
    @beforeRoute
    b(){
        console.log('beforeRoute');
        this.count +=1;
    }
    @afterRoute
    c(){
        console.log('afterRoute');
        this.count +=1;
    }
}
@service
class BService{
    b(){
        console.log('b');
    }
}

let app = new Koa();
app.use(koaBody());
app.use(initAll({
    route: {
        base: ['/api', 'get'],
    }
}));
app.listen(3001)