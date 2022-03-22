import bcrypt from "bcrypt";
import {NextFunction, Request, Response} from "express";
import {generateAccessToken, generateRefreshToken} from "../utils/generateTokens";
import {CustomError} from "../utils/errorHandler";
import User from "../models/User";
import Token from "../models/Token";

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const firstName = req.body.firstName
        const lastName = req.body.lastName
        const email = req.body.email.toLowerCase()
        const password = req.body.password

        if (!email || email === '' || typeof email !== 'string') {
            return next(new CustomError("You must supply an email address in order to create an account", 400));
        }
        if (!firstName || firstName === '' || typeof firstName !== 'string') {
            return next(new CustomError("You must supply a first name in order to create an account", 400));
        }
        if (!lastName || lastName === '' || typeof lastName !== 'string') {
            return next(new CustomError("You must supply a last name in order to create an account", 400));
        }

        if (!password || password === '') {
            return next(new CustomError('You must supply a password in order to create an account', 400));
        }

        const user = await User.findOne({email: email})

        if (user) {
            return next(new CustomError("A user with this email already exists. Please use a different email.", 400))
        }

        // PASSWORD HASHING GETS DONE PRE-SAVE
        const newUser = new User({email, password, firstName, lastName})

        await newUser.save()

        await res.json({
            _id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            isAdmin: newUser.isAdmin,
        })

    } catch (err) {
        next(err)
    }
}

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await User.find().select('-password')
        await res.json(users)
    } catch (err) {
        next(err)
    }
}

export const getUserInformation = async (req: Request, res: Response) => {
    res.json(req.user)
}

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    const payload = req.body

    try {

        const user = await User.findOne({_id: id})

        if (!user) {
            return next(new CustomError("User with specified id not found", 404))
        }

        user.firstName = payload.firstName
        user.lastName = payload.lastName
        user.isAdmin = payload.isAdmin

        await user.save()

        await res.json({
            success: true
        })

    } catch (err) {
        next(err)
    }
}

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    try {
        await User.findOneAndDelete({_id: id})
        await res.json({
            message: "Successfully deleted user"
        })
    } catch (err) {
        next(err)
    }
}


export const validateUser = async (req: Request, res: Response, next: NextFunction) => {
    const email = req.body.email.toLowerCase()
    const password = req.body.password
    try {

        if (!email || email === '' || typeof email !== 'string') {
            return next(new CustomError("You must supply an email address in order to login", 400));
        }

        if (!password || password === '' || typeof password !== 'string') {
            return next(new CustomError('You must supply a password in order to login', 400));
        }

        const user = await User.findOne({email: email})
        if (!user) {
            return next(new CustomError("Incorrect email or password", 403))
        } else {
            const match = await bcrypt.compare(password, user.password)
            if (match) {
                const refreshToken = generateRefreshToken(user._id)
                if (refreshToken) {
                    const token = new Token({
                        userId: user._id,
                        token: refreshToken
                    })
                    await token.save()
                }

                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    sameSite: 'strict',
                    secure: true
                });

                res.cookie("li", true, {
                    httpOnly: false,
                    secure: true,
                    sameSite: 'strict'
                });

                const userInfo = {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    isAdmin: user.isAdmin,
                }

                const accessToken = generateAccessToken(user._id)

                await res.json({
                    userInfo,
                    accessToken
                })

            } else {
                return next(new CustomError("Incorrect email or password", 403))
            }
        }
    } catch (err) {
        next(err)
    }
}

export const getEditUser = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    try {
        const user = await User.findOne({_id: id}).select("-password")
        if (!user) {
            return next(new CustomError("Incorrect email or password", 403))
        }
        await res.json(user)
    } catch (err) {
        next(err)
    }
}

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {

        if (!req.user) {
            return next(new CustomError("You don't have permission to do this", 403))
        }

        const {originalPassword, newPassword, repeatPassword} = req.body

        if (!originalPassword || originalPassword === '' || typeof originalPassword !== 'string') {
            return next(new CustomError("You must supply your current password.", 400));
        }

        if (!newPassword || newPassword === '' || typeof newPassword !== 'string') {
            return next(new CustomError("You must supply your new password.", 400));
        }

        if (!repeatPassword || repeatPassword === '' || typeof repeatPassword !== 'string') {
            return next(new CustomError("You must supply your new password.", 400));
        }

        // even though we have req.user, need to find user again as req.user doesn't have password
        const user = await User.findOne({_id: req.user._id})

        if (!user) {
            return next(new CustomError("No user found with specified id.", 404));
        }

        // check if current password is correct
        const match = await user.validatePassword(originalPassword)

        if (!match) {
            return next(new CustomError("The current password entered is incorrect.", 400))
        }

        // check if newPassword and resetPassword are the same
        if (newPassword !== repeatPassword) {
            return next(new CustomError("The passwords entered are not the same.", 400))
        }

        if (newPassword === originalPassword) {
            return next(new CustomError("Please make sure you choose a password you've not used before.", 400))
        }

        user.password = newPassword

        // PASSWORD GETS HASHED PRE-SAVE
        await user.save()

        await res.json({
            message: "Successfully saved new password"
        })

    } catch (err) {
        next(err)
    }
}

export const editShippingDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return next(new CustomError("You don't have permission to do this", 403))
        }

        const {address, city, postCode, county, country} = req.body

        if (!address || address === '' || typeof address !== 'string') {
            return next(new CustomError("You must supply your address.", 400));
        }
        if (!city || city === '' || typeof city !== 'string') {
            return next(new CustomError("You must supply your city or town.", 400));
        }
        if (!postCode || postCode === '' || typeof postCode !== 'string') {
            return next(new CustomError("You must supply your post code.", 400));
        }
        if (!county || county === '' || typeof county !== 'string') {
            return next(new CustomError("You must supply your county.", 400));
        }
        if (!country || country === '' || typeof country !== 'string') {
            return next(new CustomError("You must supply your country.", 400));
        }

        const user = req.user

        await user.addShippingDetails(req.body)

        await res.json({
            message: "success"
        })
    } catch (err) {
        next(err)
    }
}


export const editUserDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {

        if (!req.user) {
            return next(new CustomError("You don't have permission to do this", 403))
        }

        const user = req.user
        const {firstName, lastName, email} = req.body
        if (!firstName || firstName === '' || typeof firstName !== 'string') {
            return next(new CustomError("You must supply your first name.", 400));
        }
        if (!lastName || lastName === '' || typeof lastName !== 'string') {
            return next(new CustomError("You must supply your last name.", 400));
        }
        if (!email || email === '' || typeof email !== 'string') {
            return next(new CustomError("You must supply your email.", 400));
        }

        user.firstName = firstName
        user.lastName = lastName
        user.email = email

        await user.save()

        await res.json({
            message: "success"
        })

    } catch (err) {
        next(err)
    }
}

export const addCheckoutAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {

        if (!req.user) {
            return next(new CustomError("You don't have permission to do this", 403))
        }

        const user = req.user

        const {address, city, postCode, county, country} = req.body

        if (!address || address === '' || typeof address !== 'string') {
            return next(new CustomError("You must supply your address.", 400));
        }
        if (!city || city === '' || typeof city !== 'string') {
            return next(new CustomError("You must supply your city or town.", 400));
        }
        if (!postCode || postCode === '' || typeof postCode !== 'string') {
            return next(new CustomError("You must supply your post code.", 400));
        }
        if (!county || county === '' || typeof county !== 'string') {
            return next(new CustomError("You must supply your county.", 400));
        }
        if (!country || country === '' || typeof country !== 'string') {
            return next(new CustomError("You must supply your country.", 400));
        }

        user.checkoutAddress = req.body

        await user.save()

        await res.json({
            message: "success"
        })
    } catch (err) {
        next(err)
    }
}
