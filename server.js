const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const flash = require("connect-flash");
const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config();

const app = express();

// ✅ MySQL Connection (pool)
const db = mysql.createPool({
  host: "localhost",
  user: "root",       // 🔹 your MySQL username
  password: "Saritadubey@2004",       // 🔹 your MySQL password
  database: "signupDB",
});

// Middleware
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
 // Ensure views directory is set
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "secretKey",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());

// Root route
app.get("/", (req, res) => {
  res.redirect("/signup");
});

// ✅ Routes
app.get("/signup", (req, res) => {
  res.render("signup", { message: req.flash("message") });
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if email exists
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length > 0) {
      req.flash("message", "Email already registered!");
      return res.redirect("/signup");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into DB
    await db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [
      name,
      email,
      hashedPassword,
    ]);

    res.render("success", { name });
  } catch (err) {
    console.error(err);
    req.flash("message", "Something went wrong!");
    res.redirect("/signup");
  }
});

app.get("/verify-otp", (req, res) => {
  res.render("verify-otp", { message: req.flash("message") });
});

// Start Server
app.listen(3000, () => {
  console.log("✅ Server started: http://localhost:3000/signup");
});
