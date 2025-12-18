import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo";
import { ownerCollection, pokemonCollection, PokemonType, trainerCollection } from "../utils";
import { findUserbyId } from "./users";
import { Trainer } from "../types-";


export const addPokemon = async (name: string, description: string, height: number, weight: number, types: PokemonType[]) => {
    const db = getDB()

    const result = await db.collection(pokemonCollection).insertOne({
        name,
        description,
        height,
        weight,
        types,
    });

    const pokemonCreado = await getPokemonID(result.insertedId.toString())
    if (!pokemonCreado) {
        return null
    }

    return pokemonCreado

}

export const CogerPokemon = async (pokemonId: string,  userId: string,nickname?: string,) => {

    const db = getDB()
    const localIdPokemon = new ObjectId(pokemonId)
    const localUser = new ObjectId(userId)

    const pokemonExistente = await getPokemonID(pokemonId)
    if (!pokemonExistente) {
        throw new Error("No esta ese pokemon pa pillar")
    }

    const trainer = await findUserbyId(userId)
    if (!trainer) {
        throw new Error("No encuentro ese entrenador")
    }

    if (trainer.pokemons.length >= 6) {
        throw new Error("No puedes tener más de 6 Pokémon");
    }
 

    const randomStat = () => Math.floor(Math.random() * 100) + 1;

    const ownedPokemon = {
        nickname,
        level: randomStat(),
        attack: randomStat(),
        defense: randomStat(),
        speed: randomStat(),
        special: randomStat(),
        pokemon: localIdPokemon,
    };

    const result = await db
        .collection(ownerCollection)
        .insertOne(ownedPokemon);

    const ownedPokemonId = result.insertedId;

    await db.collection<Trainer>(trainerCollection).updateOne(
        { _id: localUser },
        { $push: { pokemons: ownedPokemonId } }
    );

    return {
        _id: ownedPokemonId.toString(),
        ...ownedPokemon,
    }
}

export const LiberarPokemon=async(ownedPokemonId:string,userId:string)=>{
    const db=getDB()
    const localUserId=new ObjectId(userId)
    const localOwnerId=new ObjectId(ownedPokemonId)

    const OwnerIdExistente= await db.collection(ownerCollection).findOne({
        _id:localOwnerId
    })
    if(!OwnerIdExistente){
        throw new Error("Ese ownerId no lo encuentra")
    }

    await db.collection<Trainer>(trainerCollection).updateOne(
        {_id:localUserId},
        {$pull:{pokemons:localOwnerId}}
    )

    const updateTrainer=findUserbyId(userId)

    return updateTrainer
}


export const getPokemonID = async (id: string) => {
    const db = getDB()
    const pokemon = await db.collection(pokemonCollection).findOne({
        _id: new ObjectId(id)
    })
    if (!pokemon) {
        return null
    }
    return pokemon
}

export const getPokemons = async (page?: number, size?: number) => {
    const db = getDB()
    page = page || 1
    size = size || 10

    return await db.collection(pokemonCollection).find().skip((page - 1) * size)
        .limit(size).toArray()
}