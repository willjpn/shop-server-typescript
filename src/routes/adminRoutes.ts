import express from "express"
import {getNewAccessToken, removeRefreshToken} from "../controllers/adminController";

const router = express.Router()

// fetch new access token
router.get("/refreshToken", getNewAccessToken)

// remove refresh token cookie when user logs out
router.get("/removeRefreshToken", removeRefreshToken)

export default router
