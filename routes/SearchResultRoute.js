const mongoose = require("mongoose")
const express = require("express")
const route = express.Router()
const {searchAdmin} = require("../controllers/SearchResultController")

route.post("/findAdmin", searchAdmin)



module.exports = route



