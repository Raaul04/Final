import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { getDB } from "./db/mongo"
import { trainerCollection } from "./utils"
import { ObjectId } from "mongodb"
import { Trainer } from "./types-"

dotenv.config()

export const signToken=(userId:string)=>{
    const SECRET=process.env.SECRET
    if(!SECRET){
        throw new Error("No esta el secret")
    }
    return jwt.sign({id:userId},SECRET as string,{expiresIn:"1h"})
}

const verifyToken=async(token:string)=>{
    try {
    const LLAVE=process.env.SECRET
    if(!LLAVE) throw new Error("No secret to decode")
    return jwt.verify(token,LLAVE) as {id:string}
        
    } catch (error) {
        console.log("validate", error)
        return null
    }
}

export const getUserFromToken=async(token:string)=>{
    const payload=await verifyToken(token)
    if(!payload){
        return null
    }
    const db=getDB()
    return await db.collection<Trainer>(trainerCollection).findOne({
        _id:new ObjectId(payload.id)
    })

}