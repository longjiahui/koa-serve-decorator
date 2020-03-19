var _dec, _dec2, _dec3, _dec4, _class, _class2;

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

const DecoratorManager = require('../decoratorManager');

let manager = new DecoratorManager();
let router = manager.register('router');
let param = manager.register('param');
let A = (_dec = router('what', 'hello'), _dec2 = param('ppp'), _dec3 = router('hal', 12), _dec4 = param('ddd'), _dec(_class = _dec2(_class = (_class2 = class A {
  a() {
    console.log('a');
  }

}, (_applyDecoratedDescriptor(_class2.prototype, "a", [_dec3, _dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "a"), _class2.prototype)), _class2)) || _class) || _class);
console.log(JSON.stringify(manager.configs));
manager.forEach((...rest) => {
  console.log(rest);
}, (...rest) => {
  console.log(rest);
});