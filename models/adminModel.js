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
  bcryptjs.hash(this.adminPassword, saltRound, (err, result) =>{
    if (err) {
      console.log(err);
    } else {
      this.adminPassword = result;
      next();
    }
  });
});

adminSchema.methods.validatePassword = function (password, callback) {
  console.log(password )
  bcryptjs.compare(password, this.adminPassword, (err, success) => {
    if (err) {
      console.log(err)
    } else {
      callback(err, success)
    }
  })
}
const adminModel = mongoose.model("admin", adminSchema);

module.exports = adminModel;
