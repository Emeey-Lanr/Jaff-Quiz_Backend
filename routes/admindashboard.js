const express = require("express");
const route = express.Router();
const {
  adminSignUp,
  emailVerification,
  login,
  adminDasboard,

  // admin quiz creation
  createQuiz,
  viewQuiz,
  loadQuizCollection,
  deleteSpecificQuizCollection,
  generateTokenForQuiz,
  getSpecificQuiz,
  uploadImageForQuiz,
  addQuestion,
  checkParticiPants
} = require("../controllers/adminController");

route.post("/signup", adminSignUp);
route.get("/verifyEmail", emailVerification)
route.post("/adminlogin", login)
route.get("/admindashboard", adminDasboard)

// quiz creation
route.post("/createquiz", createQuiz)
route.post("/saveClassId", viewQuiz);
route.get("/loadcollections", loadQuizCollection)
route.post("/deleteCollection", deleteSpecificQuizCollection)
route.post("/generateQuizSpecificToken", generateTokenForQuiz)
route.get("/getSpecificQuiz", getSpecificQuiz)
route.post("/uploadImgForQuiz", uploadImageForQuiz);
route.post("/addSpecificQuestion",addQuestion)
route.get("/findParticipants", checkParticiPants)

module.exports = route;
