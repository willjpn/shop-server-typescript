import express from "express"
import {upload} from "../middleware/productMiddleware";
import {
    createProduct,
    deleteProduct,
    getProduct,
    getProducts,
    queryProducts,
    updateProduct
} from "../controllers/productController";
import {isAdmin, validateAccessToken} from "../middleware/authMiddleware";

const router = express.Router()

// create a product
router.post("/", upload.single("image"), validateAccessToken, isAdmin, createProduct)

// get all products
router.get("/", getProducts)

// get products based on query
router.post("/query", queryProducts)

// get a product
router.get("/:id", getProduct)

// update a product
router.put("/:id", validateAccessToken, isAdmin, updateProduct)

// delete a product
router.delete("/:id", validateAccessToken, isAdmin, deleteProduct)

export default router
