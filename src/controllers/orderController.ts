import {NextFunction, Request, Response} from "express";
import {CustomError} from "../utils/errorHandler";
import Order from "../models/Order";
import User from "../models/User";

export const getAdminOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await Order.find().populate('user', '-password').populate('items.product')

        res.json(orders)
    } catch (err) {
        next(err)
    }
}

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user
    const payload = req.body
    try {

        if (!user) {
            return next(new CustomError("You don't have permission to do this", 403))
        }

        payload.user = user._id

        const count = await Order.countDocuments({isPaid: false, user: user._id})

        if (count >= 5) {
            return next(new CustomError("You can not have more than five outstanding orders at any one time.", 500))
        }

        const order = new Order(payload)

        await order.save()

        // once the order has been paid for, remove the temporary address so the user has to reconfirm the shipping address for their order
        const orderUser = await User.findOne({_id: user._id})

        if (!orderUser) {
            return next(new CustomError("Unable to find using with the specified id.", 404))
        }

        orderUser.checkoutAddress = {}
        await orderUser.save()

        res.json(order)
    } catch (err) {
        next(err)
    }
}

export const getUserOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user

        if (!user) {
            return next(new CustomError("You don't have permission to do this", 403))
        }

        const orders = await Order.find({user: user._id})

        if (!orders) {
            return next(new CustomError("Unable to find orders with the id provided.", 404))
        }

        res.json(orders)
    } catch (err) {
        next(err)
    }
}

export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id

        if (!req.user) {
            return next(new CustomError("You don't have permission to do this", 403))
        }

        // find order where its id is equal to id provided && where order's user id === req.user._id
        // populate user field excluding password
        // populate items.product objects

        const order = await Order.findOne({
            _id: id,
            user: req.user._id
        }).populate('user', '-password').populate('items.product')

        if (!order) {
            return next(new CustomError("Unable to find order with the id provided.", 404))
        }

        res.json(order)

    } catch (err) {
        next(err)
    }
}

export const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    try {
        await Order.findOneAndDelete({_id: id})
        res.json({
            message: "Successfully deleted order"
        })
    } catch (err) {
        next(err)
    }
}

export const payOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {

        if (!req.user) {
            return next(new CustomError("You don't have permission to do this", 403))
        }

        const userId = req.user._id
        const orderId = req.params.id

        const order = await Order.findOne({_id: orderId, user: userId})

        if (!order) {
            return next(new CustomError("Unable to find order with the id provided.", 404))
        }

        order.isPaid = true

        await order.save()

        res.json({
            success: true
        })

    } catch (err) {
        next(err)
    }
}
