import {Document, model, Model, Schema} from 'mongoose';

const ProductSchema = new Schema<IProduct>({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    stockCount: {
        type: Number,
        default: 0
    },
    productCode: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
})

export interface IProduct extends Document {
    _id: Document['_id']
    name: string
    price: number
    image: string
    stockCount: number
    productCode: string
    description: string
}

export interface IProductModel extends Model<IProduct> {
}

export default model<IProduct, IProductModel>("Product", ProductSchema)
