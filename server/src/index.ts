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
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
