import "reflect-metadata";
import { DataSource } from "typeorm";
import { Member } from "./entity/Member";
import { Session } from "./entity/Session";
import { Post } from "./entity/Post";
require("dotenv").config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  logging: false,
  entities: [Member, Post, Session],
  migrations: [],
  subscribers: [],
});
