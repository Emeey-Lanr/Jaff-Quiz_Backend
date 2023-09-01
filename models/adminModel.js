const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const adminSchema = mongoose.Schema({
  adminEmail: { type: String, unique: true },
  adminUserName: { type: String, unique: true },
  adminPassword: { type: String },
  adminImg: { type: String },
  adminEmailVerificationStatus: { type: Boolean },
  searchId:{type:String},
  locked:{type:Boolean}
});


const adminModel = mongoose.model("admin", adminSchema);

module.exports = adminModel;
