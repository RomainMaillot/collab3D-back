import { Request, Response, NextFunction } from 'express'
import { HttpStatusCode } from '../types'

export default (routes: string[]) => (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers['x-auth-token']

    let isAuthenticatedRoute = true

    // routes: ['user', 'user/:id']
    for (let i = 0; i < routes.length; i++) {
        const route = routes[i]

        if(routes.includes(req.originalUrl)){
            break
        }

        const regex = new RegExp(route.replace(/:(.*)\//, '.*'))

        if(!req.originalUrl.match(regex)) {
            isAuthenticatedRoute = false
            break
        }
    }

    if(isAuthenticatedRoute) {
        if (token === 'secret') {
            next()
        } else {
            res.sendStatus(HttpStatusCode.UNAUTHORIZED)
        }
    } else {
        next()
    }

}