const express = require("express")
const route = express.Router()
const {
  adminGameLogin,
  userGamePinVerification,
  verifyPlayerPassToken,
  uploadPlayerImage,
  savePlayerDetails,
  verifyAdminStatus,
} = require("../controllers/Game");


route.post("/adminlogin", adminGameLogin)
route.post("/verifyUserPin", userGamePinVerification)
route.get("/verifyPassToken", verifyPlayerPassToken)
route.post("/uploadPlayerImg", uploadPlayerImage)
route.post("/savePlayerDetails", savePlayerDetails)
route.get("/verifystatus", verifyAdminStatus)











module.exports = route