import express, {Request, Response, NextFunction} from "express";
import {connectToDatabase} from "./src/db";
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import userRoutes from "./src/routes/userRoutes";
import adminRoutes from "./src/routes/adminRoutes";
import paypalRoutes from "./src/routes/paypalRoutes";
import orderRoutes from "./src/routes/orderRoutes";
import productRoutes from "./src/routes/productRoutes";

const app = express()

dotenv.config();

connectToDatabase()

app.set('trust proxy', 1)

app.use(cors({credentials: true, origin: 'https://will-webshop.com'}))

app.use('/uploads', express.static('uploads'));

app.use(express.json())
app.use(cookieParser())

app.use("/user", userRoutes)
app.use("/admin", adminRoutes)
app.use("/product", productRoutes)
app.use("/order", orderRoutes)
app.use("/paypal", paypalRoutes)

app.use((req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Invalid endpoint: ${req.originalUrl}`)
    res.status(404)
    next(error)
})

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500).send(err.message)
})

app.listen(process.env.PORT, () => {
    console.log("Listening on port", process.env.PORT)
})
