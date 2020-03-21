const Koa = require('koa');
const koaBody = require('koa-body');
const {route, param, query, routeAll, service, serviceAll, initAll, errno} = require('../index');

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
    test(ctx){
        ctx.aService.a();
        console.log('lala');
        ctx.body = {
            hello: '1'
        }
    }

    @query({
        b: /test/
    })
    @route('/apid')
    test2(ctx){
        console.log('lala');
        ctx.body = {
            hello: '2'
        }
    }
}

@service
class AService{
    a(){
        console.log(typeof this.ctx);
        this.ctx.bService.b();
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
app.listen(3000)