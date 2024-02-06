import "reflect-metadata";
import { DataSource } from "typeorm";
import { Musician } from "./entity/Musician";
import { Session } from "./entity/Session";
import { GasUp } from "./entity/GasUp";
import { Comment } from "./entity/Comment";
import dotenv from "dotenv";

dotenv.config();

console.log("logging env vars :", process.env);

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  logging: false,
  entities: [Musician, Session, Comment, GasUp],
  migrations: [],
  subscribers: [],
});
