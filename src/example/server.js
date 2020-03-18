const Koa = require('koa');
const koaBody = require('koa-body');
const {route, params, queries, routeAll, errno} = require('../index');

@route('/', 'get')
class A{
    @queries({
        a: /test/
    })
    @params({
        'b?': /test/,
        'c?': val=>val.length > 3
    })
    @route('/abc')
    test(ctx){
        console.log('lala');
        ctx.body = {
            hello: '1'
        }
    }

    @queries({
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

let app = new Koa();
app.use(koaBody());
app.use(routeAll({
    base: '/api'
}));
app.listen(3001)