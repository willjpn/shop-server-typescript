import express from "express"
import {
    getAdminOrders,
    createOrder,
    payOrder,
    getOrder,
    getUserOrders,
    deleteOrder
} from "../controllers/orderController";
import {isAdmin, validateAccessToken} from "../middleware/authMiddleware";

const router = express.Router()

router.get('/', validateAccessToken, isAdmin, getAdminOrders)

router.post('/', validateAccessToken, createOrder)

router.post('/:id/pay', validateAccessToken, payOrder)

router.get('/user-orders', validateAccessToken, getUserOrders)

router.get('/:id', validateAccessToken, getOrder)

router.delete('/:id', validateAccessToken, isAdmin, deleteOrder)

export default router
