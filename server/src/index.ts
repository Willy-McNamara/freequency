import { AppDataSource } from "./data-source";
//import { User } from "./entity/Member";
import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";

const app = express();

// middleware
app.use(cors());
// custom logging func, can play with later..
app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
    ].join(" ");
  })
);
// serve up front end (this mostly works, but some of the components act slightly different.. look into it later)
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

const port = process.env.PORT || 3000;

// AppDataSource.initialize()
//   .then(async () => {
//     // console.log("Inserting a new user into the database...")
//     // const user = new User()
//     // user.firstName = "Timber"
//     // user.lastName = "Saw"
//     // user.age = 25
//     // await AppDataSource.manager.save(user)
//     // console.log("Saved a new user with id: " + user.id)

//     // console.log("Loading users from the database...")
//     // const users = await AppDataSource.manager.find(User)
//     // console.log("Loaded users: ", users)

//     // console.log("Here you can setup and run express / fastify / any other framework.")

//     app.listen(port, () => {
//       console.log(`Server is running on port ${port}`);
//     });
//   })
//   .catch((error) => console.log(error));
