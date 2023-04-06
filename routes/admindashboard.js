const express = require("express");
const route = express.Router();
const {
  adminSignUp,
  emailVerification,
  login,
  adminDasboard,
  uploadSettingImage,

  // admin quiz creation
  createQuiz,
  viewQuiz,
  loadQuizCollection,
  deleteQuestion,
  editQuestion,
  generateMorePassword,
  quizAcessPassword,
  removeQuizAcessPassword,
  deleteSpecificQuizCollection,
  generateTokenForQuiz,
  getSpecificQuiz,
  uploadImageForQuiz,
  addQuestion,
  checkParticiPants,
  // /////
  deleteQuiz
} = require("../controllers/adminController");

route.post("/signup", adminSignUp);
route.get("/verifyEmail", emailVerification)
route.post("/adminlogin", login)
route.get("/admindashboard", adminDasboard)
route.post("/settingImage", uploadSettingImage)
// quiz creation
route.post("/createquiz", createQuiz)
route.post("/saveClassId", viewQuiz);
route.get("/loadcollections", loadQuizCollection)
route.post("/deleteQuestion", deleteQuestion)
route.post("/editQuestion", editQuestion)
route.post("/generateMorePassword", generateMorePassword);
route.post("/quizacesspassword", quizAcessPassword)
route.post("/removeAcessPin", removeQuizAcessPassword)
route.post("/deleteCollection", deleteSpecificQuizCollection)
route.post("/generateQuizSpecificToken", generateTokenForQuiz)
route.get("/getSpecificQuiz", getSpecificQuiz)
route.post("/uploadImgForQuiz", uploadImageForQuiz);
route.post("/addSpecificQuestion",addQuestion)
route.get("/findParticipants", checkParticiPants)

// ///////////////////////
route.post("/deleteQuiz", deleteQuiz)


module.exports = route;
