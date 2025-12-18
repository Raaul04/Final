import bcrypt from "bcryptjs"
import { getDB } from "../db/mongo"
import { userCollection } from "../utils"
import { ObjectId } from "mongodb"
import { User } from "../types-"



export const createUser=async(email:string,password:string)=>{
    const db=getDB()
    const passwordEncryptada=await bcrypt.hash(password,10)
    const user=await db.collection(userCollection).insertOne(
        {
            email,
            password:passwordEncryptada
        }
    )

    return user.insertedId.toString()
}

export const validateUser = async (email: string, password: string) => {
    const db = getDB()
    const user = await db.collection(userCollection).findOne({ email })
    if (!user) {
        return null
    }
    const passComparada = await bcrypt.compare(password, user.password)
    if (!passComparada) {
        return null
    }
    return user
}

export const findUserbyId = async (id: string) => {
    const db = getDB()
    return db.collection<User>(userCollection).findOne({
        _id: new ObjectId(id)
    })
}
