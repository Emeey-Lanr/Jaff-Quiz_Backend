const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const adminSchema = mongoose.Schema({
  adminEmail: { type: String, unique: true },
  adminUserName: { type: String, unique: true },
  adminPassword: { type: String },
  adminImg: { type: String },
  adminEmailVerificationStatus: { type: Boolean },
});

const saltRound = 5;
adminSchema.pre("save", function (next) {
  console.log(this.adminPassword, "+++++++++++++++");
  bcryptjs.hash(this.adminPassword, saltRound, (err, result) =>{
    if (err) {
      console.log(err);
    } else {
      this.adminPassword = result;
      console.log(this.adminPassword, "__________________", result);
      next();
    }
  });
});
const adminModel = mongoose.model("admin", adminSchema);

module.exports = adminModel;
