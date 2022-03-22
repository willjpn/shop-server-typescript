import {model, Schema, Document, Model} from 'mongoose';
import {Response} from "express";

const TokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {type: Date, expires: '7d', default: Date.now}
})

export interface IToken extends Document {
    userId: Document['_id']
    token: string
    createdAt: Date
}

export interface ITokenModel extends Model<IToken> {
}

export default model<IToken, ITokenModel>('Token', TokenSchema);
