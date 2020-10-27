require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const bcrypt = require("bcrypt");
const Mail = require(path.join(__dirname, "config/mail"));
const Strategy = require(path.join(__dirname, "config/passport.js"));

//Set up
app = express();
passport.use(Strategy);

// Middlewares
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/api/*", passport.authenticate("jwt", { session: false }));

// Routes
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let rawData = fs.readFileSync("users.json");
  let users = JSON.parse(rawData);

  let user = users.find((user) => {
    return user.email == email;
  });

  if (user) {
    if (await bcrypt.compare(password, user.password)) {
      let payload = {
        id: user.id,
      };
      let token = jwt.sign(payload, process.env.SECRET);
      delete user["password"];
      return res.json({
        success: true,
        message: "Logged in successfully",
        user: user,
        token: token,
        tokenType: "Brearer ",
      });
    }
  }
  return res.status(401).json({
    success: false,
    msg: "Password/email combination is incorrect",
  });
});

app.post("/register", async (req, res) => {
  try {
    // Store all in User table
    const { email, password, name } = req.body;
    let salt = await bcrypt.genSalt(process.env.SALT || 10);
    const _hashPassword = await bcrypt.hash(password, salt);

    const newUser = {
      name,
      email,
      password: _hashPassword,
    };

    const rawUsers = fs.readFileSync("users.json");
    const users = JSON.parse(rawUsers);

    // check mail exist
    let user = users.find((user) => {
      return user.email == email;
    });

    if (!user) {
      users.push(newUser);
      fs.writeFileSync("users.json", JSON.stringify(users));
      delete newUser["password"];
      return res.status(201).json({
        success: true,
        message: "New user created successfully",
        user: newUser,
      });
    }
    return res.status(422).json({
      success: false,
      message: "Email already exit",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error Occured, Please try again",
    });
  }
});

app.post("/contact", (req, res) => {
  // create message
  const { name, from, phone, message } = req.body;
  const mailOptions = {
    from: email,
    to: "admin@example.com",
    subject: `${process.env.APP_NAME} Contact Form`,
    text: message,
  };

  Mail.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error Occured, Please try again",
        error,
      });
    } else
      return res.status(200).json({
        success: true,
        message: "Email sent successfully",
        info,
      });
  });
});

app.get("/", (req, res) => {
  res.end("API under development");
});

// Starting Server
app.listen(process.env.PORT || 8080);
