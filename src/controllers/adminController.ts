import jwt from "jsonwebtoken";
import {CustomError} from "../utils/errorHandler";
import {generateAccessToken} from "../utils/generateTokens";
import User from "../models/User";
import {NextFunction, Request, Response} from "express";
import Token from "../models/Token";

export const getNewAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    try {

        if (!req.cookies.refreshToken || req.cookies.refreshToken === '' || typeof req.cookies.refreshToken !== 'string') {
            return next(new CustomError("No refresh token provided.", 400));
        }

        const refreshToken = await Token.findOne({token: req.cookies.refreshToken})

        if (!refreshToken) {
            return next(new CustomError("Invalid refresh token provided", 400))
        }

        let decoded: any

        try {
            decoded = jwt.verify(req.cookies.refreshToken, process.env.REFRESH_TOKEN_SECRET as string)
        } catch (err) {
            return next(new CustomError("Unable to verify refresh token", 400))
        }

        const accessToken = generateAccessToken(decoded.id)

        const user = await User.findOne({_id: decoded.id}).select("-password")

        if (!user) {
            return next(new CustomError("Unable to user with specified id", 400))
        }

        res.json({
            accessToken: accessToken,
            userInfo: user
        })

    } catch (err) {
        next(err)
    }
}

export const removeRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.clearCookie("refreshToken")
        res.json({
            message: "Refresh token removed"
        })
    } catch (err) {
        next(err)
    }
}
