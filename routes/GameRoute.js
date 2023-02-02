const express = require("express")
const route = express.Router()
const {adminGameLogin, verifyAdminStatus} =require("../controllers/Game")


route.post("/adminlogin", adminGameLogin)
route.get("/verifystatus", verifyAdminStatus)











module.exports = route