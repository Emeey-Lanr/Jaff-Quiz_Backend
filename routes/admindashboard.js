const express = require("express");
const route = express.Router();
const {
  adminSignUp,
  emailVerification,
  login,
  adminDasboard,

  // admin quiz creation
  createQuiz,
} = require("../controllers/adminController");

route.post("/signup", adminSignUp);
route.get("/verifyEmail", emailVerification)
route.post("/adminlogin", login)
route.get("/admindashboard", adminDasboard)

// quiz creation
route.post("/createquiz", createQuiz)

module.exports = route;
