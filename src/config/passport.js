const passportJWT = require("passport-jwt");
const path = require("path");
const fs = require("fs");

const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy;

let JWTOptions = {};

JWTOptions.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
JWTOptions.secretOrKey = process.env.SECRET;
const Strategy = new JWTStrategy(JWTOptions, (JWTPayloads, next) => {
  try {
    let rawData = fs.readFileSync("users.json");
    let users = JSON.parse(rawData);
    console.log(users);
    let user = users.map((user) => user.email == JWTPayloads.email);
    if (user) next(null, user);
    next(null, false);
  } catch (error) {
    next(error, false);
  }
});

module.exports = Strategy;
