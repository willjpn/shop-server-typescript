import jwt from "jsonwebtoken"
import {NextFunction, Response, Request} from "express";
import {CustomError} from "../utils/errorHandler";
import User from "../models/User";

export const validateAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bearer = req.headers.authorization

        if (!bearer) {
            return next(new CustomError("No bearer token provided", 401))
        }

        let accessToken

        if (!bearer.startsWith("Bearer")) {
            return next(new CustomError("Invalid bearer token provided", 401))
        }

        accessToken = bearer.split(" ")[1]

        if (!accessToken) {
            return next(new CustomError("No access token provided", 401))
        }

        let decoded: any

        try {
            decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string)
        } catch (err) {
            return next(new CustomError("Unable to verify the access token", 401))
        }

        const user = await User.findOne({_id: decoded.id}).select("-password")
        if (user) {
            req.user = user
        }
        next()

    } catch (err) {
        next(err)
    }
}

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user
    if (!user) {
        return next(new CustomError("You don't have permission to do this", 403))
    }
    if (!user.isAdmin) {
        return next(new CustomError("You don't have permission to do this", 403))
    }
    next()
}
