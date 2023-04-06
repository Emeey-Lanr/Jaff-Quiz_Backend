const express = require("express")
const route = express.Router()
const {
  searchAdmin,
  jwtAdminId,
  getAdminDetails,
  searchCollection,
  findQuizPlayed,
} = require("../controllers/SearchResultController");

route.post("/findAdmin", searchAdmin)
route.post("/saveAdminId", jwtAdminId)
route.get("/loadAdminDetails", getAdminDetails);
route.post("/adminCollection", searchCollection);
route.post("/gamePlayedResult", findQuizPlayed)



module.exports = route



