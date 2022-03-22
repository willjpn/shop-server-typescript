import jwt from "jsonwebtoken"

export const generateAccessToken = (id: string) => {
    return jwt.sign({id}, process.env.ACCESS_TOKEN_SECRET as string, {
        expiresIn: "5m"
    })
}

export const generateRefreshToken = (id: string) => {
    return jwt.sign({id}, process.env.REFRESH_TOKEN_SECRET as string, {
        expiresIn: "7d"
    })
}

