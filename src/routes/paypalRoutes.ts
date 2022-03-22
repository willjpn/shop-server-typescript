import express, {Request, Response, NextFunction} from "express"

const router = express.Router()

router.get("/", (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = process.env.PAYPAL_ID
        res.json(id)
    } catch (err) {
        next(err)
    }
})

export default router
