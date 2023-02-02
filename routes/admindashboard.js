const express = require("express");
const route = express.Router();
const {
  adminSignUp,
  emailVerification,
  login,
  adminDasboard
} = require("../controllers/adminController");

route.post("/signup", adminSignUp);
route.get("/verifyEmail", emailVerification)
route.post("/adminlogin", login)
route.get("/admindashboard", adminDasboard)

module.exports = route;
