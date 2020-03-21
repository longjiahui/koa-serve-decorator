# feature

- route
- param
- query
- loginCheck
- 基于`stage-1`的decorator，使用`@babel/plugin-proposal-decorators`插件时需要设置`{"legacy": true}`

# Install

`npm i koa-serve-decorator`

# API

### `@route(path: string, method?: string)`

声明一个路由，可以装饰到类/方法上，可以在`routeAll`时提供`base: String`来设置baseURL

### `@param(param: Object)`

声明body参数的校验规则，如果不满足会抛出异常，会对`ctx.request.body`和`ctx.params`的内容进行校验，不能出现相同的变量名，因为是合在一起校验的

### `@query(param: Object)`

声明query参数的校验规则，如果不满足会抛出异常

> 参数校验依赖于 [`validator-biang`](https://github.com/longjiahui/validator-biang)

### `@loginCheck`

声明是否需要检查用户是否登录，依赖[`jsonwebtoken`]([https://](https://www.npmjs.com/package/jsonwebtoken))，使用时需要在`routeAll`时提供`jwtSecret: String`, `getToken: Function`两个值

### `@service`

装饰一个类，会在类中注入ctx成员，同时创建一个该类的对象挂载在ctx中，且不同的service之间可以互相调用。

### `@beforeRoute`

装饰service的类成员函数，此service的成员函数会在每次用户请求时被调用

### `@afterRoute`

装饰service的类成员函数，此service的成员函数会在每次用户请求后被调用

### `routeAll(options: Object)`

因为`@loginCheck`, `@route`, `@param`, `@query`之间在实现的层面存在顺序问题，所以他们的初始化都使用同一个`routeAll函数`，当然，**使用的顺序是不会影响结果的**，`serviceAll`应该在`routeAll`前被注册

- `options`
  - `jwtSecret: string` 提供`jsonwebtoken`库所需要的`jwtSecret`
  - `getToken: Function` 提供`@loginCheck`所需要的`token`来源。
  - `base: [0: path, 1?: method]` 提供所有`@route`标记的控制器的根路径
    - e.g. `base: ['/api', 'all']`
    - e.g. 只设置`method` `base: ['/', 'all']`
    - e.g. 只设置`path` `base: ['/']`
  
### `serviceAll()`

初始化所有的`@service`，实现service标记的功能，`serviceAll`应该在`routeAll`前被注册

### `initAll(options: Object)`

初始化全部decorators，会顺序调用`serviceAll`与`routeAll`

- `options: Object`
  - `route: Object` `routeAll`的参数
  - `dirs: [[string]]` 指定该参数可以自动include所有的路由类和Service类，基于[`require-all`](https://github.com/felixge/node-require-all)
    - e.g. 后面recursive部分的其它配置参考require-all的配置
        ```javascript
        initAll({
            dirs: [
                [`${__dirname}/controller`, {recursive: true}],
                //...
            ]
        })
        ```
    - 当前默认的配置是 `filter: /.js$/` 
  - service还没有相关参数，所以位置如此预留了

```javascript

const Koa = require('koa');
const {route, param, query, loginCheck, service, initAll} = require('koa-serve-decorator');

@route('/post', 'get')
class A{

    @route('/:id')
    //id必须存在，同时为非空字符串
    //详细规则参考 https://github.com/longjiahui/validator-biang
    @param({
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
        //这里可以访问service
        ctx.bService;
        ctx.aService;
    }
}

@service
class AService{
    a(){
        console.log('a');
        //service可以访问service 或者ctx的其它内容
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
app.use(initAll({
    route:{
        // 设置baseURL 则@route监听的路由都会设置在/api下
        base: ['/api', 'post'],
        // 设置loginCheck所需要的参数
        jwtSecret: 'secret',
        getToken: ctx=>ctx.headers.authorization,
    }
}));
app.listen(3000);
```

# 错误捕获

已经错误会以错误码提供，详细信息参考`err.msg`字段

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