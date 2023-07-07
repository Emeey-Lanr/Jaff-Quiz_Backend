const adminModel = require("../models/adminModel");
class GameValidators {
    static async adminGameLogin() {
      const admin = await adminModel.findOne({_id:username})
  }
}
