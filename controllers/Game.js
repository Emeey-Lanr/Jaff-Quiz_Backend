const jwtId = require("jsonwebtoken");
const adminGameLogin = (req, res) => {
  console.log(req.body);
  const adminCode = jwtId.sign({ adminStatus: true }, process.env.GS, {
    expiresIn: "7d",
  });
  res.send({ message: "status", status: true, adminStatusId: adminCode });
};

const verifyAdminStatus = (req, res) => {
  let id = req.headers.authorization.split(" ")[1];
  jwtId.verify(id, process.env.GS, (err, result) => {
    if (err) {
      res.send({ status: false });
    } else {
      console.log(result);
      res.send({ status: true, adminStatus: result.adminStatus });
    }
  });
};


module.exports = {
  adminGameLogin,
  verifyAdminStatus,
};
