import { ObjectId } from "mongodb"

export type Trainer={
    _id:ObjectId
    name:string
    password:string,
    pokemons:ObjectId[]
}

export type OwnedPokemon={
  _id?: ObjectId
  pokemon: ObjectId
  nickname: string
  attack: number
  defense: number
  speed: number
  special: number
  level: number
}
export type Pokemon={
  _id?: ObjectId
  name: string
  description: string
  height: number
  weight:number
  types: string[]
}