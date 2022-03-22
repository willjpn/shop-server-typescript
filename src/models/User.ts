import {Document, model, Model, Schema} from 'mongoose';
import bcrypt from "bcrypt"

const UserSchema = new Schema<IUser>({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    shippingDetails: {
        address: {
            type: String,
        },
        city: {
            type: String,
        },
        postCode: {
            type: String,
        },
        county: {
            type: String,
        },
        country: {
            type: String,
        },
    },
    checkoutAddress: {
        address: {
            type: String,
        },
        city: {
            type: String,
        },
        postCode: {
            type: String,
        },
        county: {
            type: String,
        },
        country: {
            type: String,
        },
    }
})

export interface ShippingDetails {
    address?: string
    city?: string
    postCode?: string
    county?: string
    country?: string
}

export interface IUser extends Document {
    validatePassword(originalPassword: string): Promise<any>;

    addShippingDetails(shippingDetails: ShippingDetails): Promise<any>;

    _id: Document['_id']
    firstName: string
    lastName: string
    email: string
    password: string
    isAdmin?: boolean
    shippingDetails?: ShippingDetails
    checkoutAddress?: ShippingDetails
}

UserSchema.methods.validatePassword = async function (pw) {
    return await bcrypt.compare(pw, this.password)
}

UserSchema.methods.addShippingDetails = async function (shippingDetails) {
    this.shippingDetails = shippingDetails
    await this.save()
}

// the function inside of this middleware has to be function() {} instead of arrow function otherwise the scope of "this" is changed
UserSchema.pre("save", async function (next) {
    // only hash password if we're creating an account (ie. not updating details for user etc)
    if (!this.isModified("password")) {
        next()
    }
    // above says if password hasn't been modified, continue and ignore hashing of password

    this.password = await bcrypt.hash(this.password, 12)
})

export interface IUserModel extends Model<IUser> {
}

export default model<IUser, IUserModel>("User", UserSchema)


