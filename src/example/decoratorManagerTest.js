const DecoratorManager = require('../decoratorManager');

let manager = new DecoratorManager();

let router = manager.register('router');
let param = manager.register('param');

@router('what', 'hello')
@param('ppp')
class A{
    @router('hal', 12)
    @param('ddd')
    a(){
        console.log('a');
    }
}

console.log(JSON.stringify(manager.configs));
manager.forEach((...rest)=>{
    console.log(rest);
}, (...rest)=>{
    console.log(rest);
});