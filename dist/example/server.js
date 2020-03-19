var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _class3, _class4;

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

const Koa = require('koa');

const koaBody = require('koa-body');

const {
  route,
  param,
  query,
  routeAll,
  service,
  serviceAll,
  initAll,
  errno
} = require('../index');

let A = (_dec = route('/', 'get'), _dec2 = query({
  a: /test/
}), _dec3 = param({
  'b?': /test/,
  'c?': val => val.length > 3
}), _dec4 = route('/abc'), _dec5 = query({
  b: /test/
}), _dec6 = route('/apid'), _dec(_class = (_class2 = class A {
  test(ctx) {
    ctx.aService.a();
    console.log('lala');
    ctx.body = {
      hello: '1'
    };
  }

  test2(ctx) {
    console.log('lala');
    ctx.body = {
      hello: '2'
    };
  }

}, (_applyDecoratedDescriptor(_class2.prototype, "test", [_dec2, _dec3, _dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "test"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "test2", [_dec5, _dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "test2"), _class2.prototype)), _class2)) || _class);

let AService = service(_class3 = class AService {
  a() {
    console.log(typeof this.ctx);
    this.ctx.bService.b();
  }

}) || _class3;

let BService = service(_class4 = class BService {
  b() {
    console.log('b');
  }

}) || _class4;

let app = new Koa();
app.use(koaBody());
app.use(initAll({
  route: {
    base: ['/api', 'get']
  }
}));
app.listen(3000);