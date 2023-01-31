const express = require("express");
const route = express.Router();
const {
  adminSignUp,
  emailVerification,
} = require("../controllers/adminController");

route.post("/signup", adminSignUp);
route.get("/verifyEmail", emailVerification)

module.exports = route;
