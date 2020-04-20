"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
exports.default = (routes) => (req, res, next) => {
    const token = req.headers['x-auth-token'];
    let isAuthenticatedRoute = true;
    // routes: ['user', 'user/:id']
    for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        if (routes.includes(req.originalUrl)) {
            break;
        }
        const regex = new RegExp(route.replace(/:(.*)\//, '.*'));
        if (!req.originalUrl.match(regex)) {
            isAuthenticatedRoute = false;
            break;
        }
    }
    if (isAuthenticatedRoute) {
        if (token === 'secret') {
            next();
        }
        else {
            res.sendStatus(types_1.HttpStatusCode.UNAUTHORIZED);
        }
    }
    else {
        next();
    }
};
//# sourceMappingURL=authentification.js.map