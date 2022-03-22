import {v4} from "uuid";
import sharp from "sharp";
import {NextFunction, Request, Response} from "express";
import {CustomError} from "../utils/errorHandler";
import Product from "../models/Product";

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const fileName = `uploads/${v4()}.png`
        if (req.file) {
            await sharp(req.file.path).png().resize({
                width: 384,
                height: 225,
                fit: 'contain',
                background: {r: 0, g: 0, b: 0, alpha: 0}
            }).toFile(fileName);
        }

        const payload = req.body

        payload.image = `https://api.will-webshop.com/${fileName}`

        const product = new Product(payload)
        await product.save()
        res.json(product)
    } catch (err) {
        res.status(500)
        return next(err)
    }

}

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await Product.find()
        await res.json(products)
    } catch (err) {
        next(err)
    }

}

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id
        const product = await Product.findOne({_id: id})

        if (!product) {
            return next(new CustomError("No product found with the id specified.", 404))
        }

        if (product) {
            res.json(product)
        } else {
            return next(new Error("Product not found"))
        }
    } catch (err) {
        next(err)
    }
}

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body
    const id = req.params.id
    try {
        const product = await Product.findOne({_id: id})
        if (!product) {
            return next(new CustomError("No product found with the id specified.", 404))
        }
        product.name = payload.name
        product.price = payload.price
        await product.save()
        res.json(product)
    } catch (err) {
        next(err)
    }

}

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    try {
        await Product.findOneAndDelete({_id: id})
        res.json({
            message: "Successfully deleted product."
        })
    } catch (err) {
        next(err)
    }
}

export const queryProducts = async (req: Request, res: Response, next: NextFunction) => {
    let query = req.body.query.toLowerCase().trim()
    let pageNumber = req.body.page || 1

    try {
        const products = await Product.find({
            name: {
                $regex: query,
                $options: 'i'
            }
        }).sort({'name': 'asc'}).skip(10 * (pageNumber - 1)).limit(10)


        const count = await Product.countDocuments({name: {$regex: query, $options: 'i'}})
        const totalCount = await Product.countDocuments()

        res.json({products, count, totalCount})

    } catch (err) {
        next(err)
    }
}
