const adminModel = require("../models/adminModel");
const nodemailer = require("nodemailer");
const quizModel = require("../models/QuizQuestionModel")
const jwt = require("jsonwebtoken");
var ID = require("nodejs-unique-numeric-id-generator")
var generator = require("generate-password")
const falseStatus = false;
const trueStatus = true;
const adminSignUp = (req, res) => {
  console.log(req.body);
 
  adminModel.find({ adminEmail: req.body.adminEmail }, (err, result) => {
    if (err) {
      res.send({ status: falseStatus, message: "an error occured" });
    } else {
      // a conditional statement to check if the array length is greater than zero
      if (result.length > 0) {
        res.send({ status: falseStatus, message: "Email already exist" });
      } else {
        //   if not we check if the username has been picked before, using find, if the array length is greater than 0
        //  wereturn amessage that username already exist
        adminModel.find(
          { adminUserName: req.body.adminUserName },
          (err, result) => {
            if (err) {
              res.send({ status: falseStatus, message: "An error occured" });
            } else {
              if (result.length > 0) {
                res.send({
                  status: falseStatus,
                  message: "Username already exist",
                });
              } else {
                //   if those two are unique then admin can now be registered
 let newUser = new adminModel(req.body);
                newUser.save((err, userResult) => {
                  if (err) {
                    res.send({
                      status: falseStatus,
                      message: "Unable to register, try again",
                    });
                  } else {
                    console.log(userResult);
                    const jwtCode = jwt.sign(
                      { userid: userResult.id },
                      process.env.Secret,
                      { expiresIn: "1h" }
                    );
                    console.log(jwtCode);
                    // res.send({ status: trueStatus, message: "succesful" });
                    var transporter = nodemailer.createTransport({
                      service: "gmail",
                      auth: {
                        user: "emeeylanr04@gmail.com",
                        pass: process.env.EmailPass,
                      },
                    });

                    var mailOptions = {
                      from: "",
                      to: req.body.adminEmail,
                      subject: "User Verification",
                      text: "That was easy!",
                      html: `<div
      style="
        width: 400px;
        margin: 0 auto;
        background-color: #f9f9fb;
        padding: 20px;
        height: 200px;
        display: flex;
        justify-content: center;
        align-items: center;
      "
    >
      <div>
        <p style="text-align: center; color: #757575; font-family: cursive;">
          Click on the button below to verify your email
        </p>
        <div
          style="
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 10px 0;
          "
        >
          <button
            style="
              border: none;
              background: #03a26c;
              border-radius: 10px;
              padding: 15px 60px;
            "
          >
            <a
              href="http://localhost:3000/${jwtCode}"
              style="color: white; text-decoration: none; font-family: cursive;" 
              >Verify</a
            >
          </button>
        </div>
      </div>
    </div>`,
                    };

                    transporter.sendMail(mailOptions, function (error, info) {
                      if (error) {
                        res.send({
                          mailstatus: true,
                          message: "an error occured",
                        });
                      } else {
                        res.send({ status: true });
                      }
                    });
                  }
                });
              }
            }
          }
        );
      }
    }
  });
};

// verify mail
const emailVerification = (req, res) => {
  // console.log(req.headers.authorization.split(" ")[1])
  let userEmailVerificationToken = req.headers.authorization.split(" ")[1];
  jwt.verify(userEmailVerificationToken, process.env.Secret, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      adminModel.findOne({_id: result.userid }, (err, user) => {
        if (err) {
          res.send({ message: "an error occured", status: falseStatus });
          console.log(err)
        } else {
          if (user !== null) {
            console.log(user)
            user.adminEmailVerificationStatus = true;
            adminModel.findByIdAndUpdate({_id: result.userid }, user, (err) => {
              if (err) {
                res.send({ message: "an error occured", status: false });
                console.log(err)
              } else {
               
                const dashboardIdentification = jwt.sign({ userId: result.userid }, process.env.Secret, { expiresIn: "7d" })
                 res.send({ message: "verified", status: trueStatus, adminId:dashboardIdentification });
              }
            });
          }
        }
      });
    }
  });
};

const login = (req, res) => {
  console.log(req.body)
  adminModel.findOne({ adminUserName: req.body.userName }, (err, admin) => {
    if (err) {
     res.send({message:"an error occured", status:false})
    } else {
      if (admin !== null) { 
        console.log(admin)
        admin.validatePassword(req.body.password, (err, same) => {
          if (err) {
            res.send({message:"an error occured", status:false})
          } else {
            console.log(same)
            if (same) {
              if (admin.adminEmailVerificationStatus) {
                let userid = jwt.sign({ userId: admin.id }, process.env.Secret, { expiresIn: "7d" })
                res.send({message:"success", status:true, adminId:userid})
              } else {
                  let jwtCode = jwt.sign({ userid: admin.id }, process.env.Secret, { expiresIn: "7d" })
                 var transporter = nodemailer.createTransport({
                   service: "gmail",
                   auth: {
                     user: "emeeylanr04@gmail.com",
                     pass: process.env.EmailPass,
                   },
                 });

                 var mailOptions = {
                   from: "",
                   to: admin.adminEmail,
                   subject: "User Verification",
                   text: "That was easy!",
                   html: `<div
      style="
        width: 400px;
        margin: 0 auto;
        background-color: #f9f9fb;
        padding: 20px;
        height: 200px;
        display: flex;
        justify-content: center;
        align-items: center;
      "
    >
      <div>
        <p style="text-align: center; color: #757575; font-family: cursive;">
          Click on the button below to verify your email
        </p>
        <div
          style="
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 10px 0;
          "
        >
          <button
            style="
              border: none;
              background: #03a26c;
              border-radius: 10px;
              padding: 15px 60px;
            "
          >
            <a
              href="http://localhost:3000/${jwtCode}"
              style="color: white; text-decoration: none; font-family: cursive;" 
              >Verify</a
            >
          </button>
        </div>
      </div>
    </div>`,
                 };

                 transporter.sendMail(mailOptions, function (error, info) {
                   if (error) {
                     res.send({
                       mailStatus: false,
                       message: "an error occured",
                     });
                   } else {
                     res.send({ mailStatus: true });
                   }
                 });
              }
            } else {
              res.send({message:"Invalid password", status:false})
            }
          }
        
      })
      } else {
        console.log("invalid login")
        res.send({message:"invalid login details", status:false})
      }
   }
 });
  
}


const adminDasboard = (req, res) => {
  let adminId = req.headers.authorization.split(" ")

  jwt.verify(adminId[1], process.env.Secret, (err, result) => {
    if (err) {
      res.send({message:"an error occured", status:false})
    } else {
      adminModel.findById({ _id: result.userId }, (err, admin) => {
        if (err) {
          res.send({message:"an error occured", status:false})
        } else {
          res.send({message:"success", status:true, adminDetails:admin})
        }
      })
    }
  })
}


// /quiz creation

const createQuiz = (req, res) => {
  quizModel.find({adminId: req.body.quizSchema.adminId }, (err, result) => {
    console.log(result)
    if (err) {
      res.send({message:"an error occured", status:false})
    } else {
      const currentClassQuiz = result.filter((content, id) => content.class === req.body.quizSchema.class)
      console.log(currentClassQuiz)
      const checkifSubjectNameExist = currentClassQuiz.filter((content, id) => content.quizName.toUpperCase() === req.body.quizSchema.quizName.toUpperCase())
     
    
    if (checkifSubjectNameExist.length > 0) {
      res.send({message:"Subject name already exist", status:false})
    } else {
      req.body.quizSchema.quizId = ID.generate(new Date().toJSON()); 
      console.log(req.body.quizSchema);
      let passwordMutiple = generator.generateMultiple(req.body.numberToBeGenerated,{
        length: 6,
        upperCase: false,
        numbers:true,
      })
      let singlePassword = generator.generate({
        length: 6,
        uppercase:true,
        numbers:true
      })
      console.log(passwordMutiple)
      if (req.body.multiple) {
        req.body.quizSchema.quizMultiplePassword = passwordMutiple
      } else {
        req.body.quizSchema.quizPin = singlePassword

      }
      const jwtClassIdentification = jwt.sign({class:req.body.quizSchema.class, adminId:req.body.quizSchema.adminId}, process.env.Secret,{expiresIn:"1d"})
      let saveNewQuiz = new quizModel(req.body.quizSchema)
      saveNewQuiz.save((err, result) => {
        if (err) {
          console.log(err)
          res.send({message:"unable to create quiz", status:false})
        } else {
          res.send({message:"created succesfully", status:true, classId:jwtClassIdentification})
        }
      })
    }
      
    }
   
  })
}

module.exports = {
  adminSignUp,
  emailVerification,
  login,
  adminDasboard,

  // quiz creation
  createQuiz,
};
