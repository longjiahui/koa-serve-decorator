# feature

- route
- params
- queries
- loginCheck
- 基于`stage-1`的decorator，使用`@babel/plugin-proposal-decorators`插件时需要设置`{"legacy": true}`

# Install

`npm i koa-serve-decorator`

# API

### `@route(path: string, method?: string)`

声明一个路由，可以装饰到类/方法上，可以在`routeAll`时提供`base: String`来设置baseURL

### `@params(params: Object)`

声明body参数的校验规则，如果不满足会抛出异常

### `@queries(params: Object)`

声明query参数的校验规则，如果不满足会抛出异常

> 参数校验依赖于 [`validator-biang`](https://github.com/longjiahui/validator-biang)

### `@loginCheck`

声明是否需要检查用户是否登录，依赖[`jsonwebtoken`]([https://](https://www.npmjs.com/package/jsonwebtoken))，使用时需要在`routeAll`时提供`jwtSecret: String`, `getToken: Function`两个值

```javascript

const Koa = require('koa');
const {route, routeAll, params, queries, loginCheck} = require('koa-serve-decorator');

@route('/post', 'get')
class A{

    @route('/:id')
    //id必须存在，同时为非空字符串
    //详细规则参考 https://github.com/longjiahui/validator-biang
    @params({
        id: 'truthyString'
    })
    async a(ctx, next){
        //路由是 get /post/:id
    }

    @loginCheck
    @query({
        content: 'truthyString',
        title: 'truthyString',
    })
    @route('/save', 'put')
    async b(ctx, next){
        //路由是 put /post/save
    }
}

let app = new Koa();
app.use(routeAll({
    // 设置baseURL 则@route监听的路由都会设置在/api下
    base: '/api',
    // 设置loginCheck所需要的参数
    jwtSecret: 'secret',
    getToken: ctx=>ctx.headers.authorization,
}));
app.listen(3000);
```

# 错误捕获

```javascript
//一个middleware
const {errno} = require('koa-serve-decorator');

module.exports = async (ctx, next)=>{
    try{
        await next();
    }catch(err){
        if(err.code === errno.ERR_ARG){
            //参数校验错误
            console.log(err.msg);
        }
}
```

### 错误码 `errno`

- `ERR_ARG`  参数错误
- `ERR_NOTOKEN`  loginCheck时没获得token
- `ERR_VERIFY_ERROR`  loginCheck校验失败
- `ERR_GETTOKEN_ERROR`  获取token失败,
- `ERR_GETJWTSECRET_ERROR`  获取jwtScret失败