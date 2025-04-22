import mongoose from 'mongoose'
import env from '../util/validate'

const db = async() => {
    try {
        const connectDB = await mongoose.connect(env.MONGODB_URL_STRING)
        console.log(`connected:${connectDB.connection.host}/${connectDB.connection.name}`)
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}

export default db