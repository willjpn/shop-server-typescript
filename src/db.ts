import mongoose from "mongoose";

export const connectToDatabase = () => {
    mongoose.connect(process.env.MONGO_URI as string, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    }).then(() => {
    }).catch((err) => {
        console.error(err.message)
        process.exit(1)
    })
}
