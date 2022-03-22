import {Document, model, Model, Schema, Types} from 'mongoose';
import dayjs from "dayjs";
import User, {ShippingDetails} from "./User";

const OrderSchema = new Schema<IOrder>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    shippingAddress: {
        address: {type: String, required: true},
        postCode: {type: String, required: true},
        city: {type: String, required: true},
        county: {type: String, required: true},
        country: {type: String, required: true}
    },
    totalPrice: {
        type: Number,
        required: true
    },
    exVat: {
        type: Number,
        required: true
    },
    vat: {
        type: Number,
        required: true
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    paidDate: {
        type: Date
    },
    isDelivered: {
        type: Boolean,
        default: false
    },
    deliveredDate: {
        type: Date
    },
    createdOn: {
        type: String,
        default: dayjs(new Date()).format('HH:mm [on] DD/MM/YYYY')
    }
}, {timestamps: true})

export interface Item {
    product: Types.ObjectId | string
    quantity: number
}

export interface IOrder extends Document {
    user: Types.ObjectId | string
    items: Item[]
    shippingAddress: ShippingDetails
    totalPrice: number
    exVat: number
    vat: number
    isPaid?: boolean
    paidDate?: Date
    isDelivered?: boolean
    deliveredDate?: Date
    createdOn?: string
}

export interface IOrderModel extends Model<IOrder> {
}

export default model<IOrder, IOrderModel>('Device', OrderSchema);

