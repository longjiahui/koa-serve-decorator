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
        return compose([serviceAll(options.service), routeAll(options.route)]);
    },
}