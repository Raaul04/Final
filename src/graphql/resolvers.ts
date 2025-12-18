import { IResolvers } from "@graphql-tools/utils";
import { createUser, validateUser } from "../collections/users";
import { signToken } from "../auth";
import { addPokemon, CogerPokemon, getPokemonID, getPokemons, LiberarPokemon } from "../collections/pokemons";
import { OwnedPokemon, Trainer } from "../types-";
import { getDB } from "../db/mongo";
import { ownerCollection, pokemonCollection } from "../utils";
import { ObjectId } from "mongodb";


export const resolvers: IResolvers = {

    Trainer: {
        pokemons: async (parent: Trainer) => {
            const db = getDB()
            const ids = parent.pokemons || []

            const idsMongo = ids.map((x) => (typeof x === "string" ? new ObjectId(x) : x));

            if (idsMongo.length === 0) return [];

            return await db.collection(ownerCollection).find({ _id: { $in: idsMongo } }).toArray();
        }
    },

    OwnedPokemon: {

        pokemon: async (parent: OwnedPokemon) => {
            const db = getDB();

            const pokeId =
                typeof parent.pokemon === "string"
                    ? new ObjectId(parent.pokemon)
                    : parent.pokemon;

            const p = await db.collection(pokemonCollection).findOne({ _id: pokeId });

            if (!p) throw new Error("Pokemon no encontrado");

            return  p
        },

    },

    Query: {
        me: async (_, __, { user }) => {
            if (!user) {
                return null
            }
            return {
                _id: user._id.toString(),
                ...user
            }

        },
        pokemon: async (_, { id }) => {
            return await getPokemonID(id)
        },
        pokemons: async (_, { page, size }) => {
            return await getPokemons(page, size)

        }
    },
    Mutation: {
        startJourney: async (_, { name, password }) => {
            const userId = await createUser(name, password)
            return signToken(userId)
        },
        login: async (_, { name, password }) => {
            const user = await validateUser(name, password)
            if (!user) {
                throw new Error("Credenciales invalidas")
            }
            return signToken(user._id.toString())
        },
        createPokemon: async (_, { name, description, height, weight, types }, { user }) => {
            if (!user) {
                throw new Error("Logeate para crear un pokemon crack")

            }
            return await addPokemon(name, description, height, weight, types)
        },
        catchPokemon: async (_, { pokemonId, nickname }, { user }) => {
            if (!user) {
                throw new Error("Logeate para pillar un pokemon crack")
            }
            return await CogerPokemon(pokemonId, user._id.toString(), nickname)

        },
        freePokemon:async(_,{ownedPokemonId},{user})=>{
            if (!user) {
                throw new Error("Logeate para liberar un pokemon crack")
            }

            return await LiberarPokemon(ownedPokemonId,user._id.toString())

        }

    }

}