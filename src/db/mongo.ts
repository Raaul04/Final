import { Db, MongoClient } from "mongodb";
import dotenv from "dotenv";
import { dbName } from "../utils";

dotenv.config();

let client: MongoClient;
let dB: Db;

export const connectToMongoDB = async () => {
    try{
        const mongoUrl = process.env.MONGO_URL;
        if(mongoUrl){
            client = new MongoClient(mongoUrl);
            await client.connect();
            dB = client.db(dbName);
            console.log("Estás conectado al mondongo");
        } else {
            throw new Error("MONGO_URL is not defined in environment variables");
        }
    }
    catch(err){
        console.log("Error del mondongo baby: ", err)
    }
};

export const getDB = ():Db => dB;