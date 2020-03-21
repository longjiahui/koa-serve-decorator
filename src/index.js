const route = require('./route');
const service = require('./service');
const compose = require('koa-compose');
const {errno} = require('./error');
const {routeAll} = route;
const {serviceAll} = service;
module.exports = {
    ...route,
    ...service,
    errno,
    initAll(options = {}){
        if(options.dirs){
            options.dirs.forEach(({0:dirname,1: requireAllOptions})=>{
                require('require-all')(Object.assign({
                    dirname,
                    filter: /.js$/,
                }, requireAllOptions));
            });
        }
        return compose([serviceAll(options.service), routeAll(options.route)]);
    },
}