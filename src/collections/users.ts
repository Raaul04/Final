import bcrypt from "bcryptjs"
import { getDB } from "../db/mongo"
import { trainerCollection } from "../utils"
import { ObjectId } from "mongodb"
import { Trainer } from "../types-"



export const createUser = async (name: string, password: string) => {
    const db = getDB()
    const exists = await db
        .collection(trainerCollection)
        .findOne({ name });

    if (exists) {
        throw new Error("El nombre ya está en uso");
    }
    const passwordEncryptada = await bcrypt.hash(password, 10)
    const user = await db.collection(trainerCollection).insertOne(
        {
            name,
            password: passwordEncryptada,
            pokemons: []

        }
    )

    return user.insertedId.toString()
}

export const validateUser = async (name: string, password: string) => {
    const db = getDB()
    const user = await db.collection(trainerCollection).findOne({ name })
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
    return db.collection<Trainer>(trainerCollection).findOne({
        _id: new ObjectId(id)
    })
}
