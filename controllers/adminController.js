const adminModel = require("../models/adminModel");
const nodemailer = require("nodemailer");
const quizModel = require("../models/QuizQuestionModel");
const jwt = require("jsonwebtoken");
var ID = require("nodejs-unique-numeric-id-generator");
var generator = require("generate-password");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.Cloudinary_cloud_name,
  api_key: process.env.Cloudinary_api_key,
  api_secret: process.env.Cloudinary_api_secret,
});
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
      adminModel.findOne({ _id: result.userid }, (err, user) => {
        if (err) {
          res.send({ message: "an error occured", status: falseStatus });
          console.log(err);
        } else {
          if (user !== null) {
            console.log(user);
            user.adminEmailVerificationStatus = true;
            adminModel.findByIdAndUpdate(
              { _id: result.userid },
              user,
              (err) => {
                if (err) {
                  res.send({ message: "an error occured", status: false });
                  console.log(err);
                } else {
                  const dashboardIdentification = jwt.sign(
                    { userId: result.userid },
                    process.env.Secret,
                    { expiresIn: "7d" }
                  );
                  res.send({
                    message: "verified",
                    status: trueStatus,
                    adminId: dashboardIdentification,
                  });
                }
              }
            );
          }
        }
      });
    }
  });
};

const login = (req, res) => {
  console.log(req.body);
  adminModel.findOne({ adminUserName: req.body.userName }, (err, admin) => {
    if (err) {
      res.send({ message: "an error occured", status: false });
    } else {
      if (admin !== null) {
        console.log(admin);
        admin.validatePassword(req.body.password, (err, same) => {
          if (err) {
            res.send({ message: "an error occured", status: false });
          } else {
            console.log(same);
            if (same) {
              if (admin.adminEmailVerificationStatus) {
                let userid = jwt.sign(
                  { userId: admin.id },
                  process.env.Secret,
                  { expiresIn: "7d" }
                );
                res.send({ message: "success", status: true, adminId: userid });
              } else {
                let jwtCode = jwt.sign(
                  { userid: admin.id },
                  process.env.Secret,
                  { expiresIn: "7d" }
                );
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
              res.send({ message: "Invalid password", status: false });
            }
          }
        });
      } else {
        console.log("invalid login");
        res.send({ message: "invalid login details", status: false });
      }
    }
  });
};

const adminDasboard = (req, res) => {
  let adminId = req.headers.authorization.split(" ");

  jwt.verify(adminId[1], process.env.Secret, (err, result) => {
    if (err) {
      res.send({ message: "an error occured", status: false });
    } else {
      adminModel.findById({ _id: result.userId }, (err, admin) => {
        if (err) {
          res.send({ message: "an error occured", status: false });
        } else {
          res.send({ message: "success", status: true, adminDetails: admin });
        }
      });
    }
  });
};

// /quiz creation

const createQuiz = (req, res) => {
  quizModel.find({ adminId: req.body.quizSchema.adminId }, (err, result) => {
    console.log(result);
    if (err) {
      res.send({ message: "an error occured", status: false });
    } else {
      const currentClassQuiz = result.filter(
        (content, id) => content.class === req.body.quizSchema.class
      );

      const checkifSubjectNameExist = currentClassQuiz.filter(
        (content, id) =>
          content.quizName.toUpperCase() ===
          req.body.quizSchema.quizName.toUpperCase()
      );

      if (checkifSubjectNameExist.length > 0) {
        res.send({ message: "Subject name already exist", status: false });
      } else {
        req.body.quizSchema.quizId = ID.generate(new Date().toJSON());
        console.log(req.body.quizSchema);
        let passwordMutiple = generator.generateMultiple(
          req.body.numberToBeGenerated,
          {
            length: 6,
            upperCase: false,
            numbers: true,
          }
        );
        let singlePassword = generator.generateMultiple(1, {
          length: 6,
          uppercase: true,
          numbers: true,
        });
        console.log(passwordMutiple);
        if (req.body.multiple) {
          req.body.quizSchema.quizMultiplePassword = passwordMutiple;
        } else {
          req.body.quizSchema.quizPin = singlePassword[0];
        }
        const jwtClassIdentification = jwt.sign(
          {
            class: req.body.quizSchema.class,
            adminId: req.body.quizSchema.adminId,
          },
          process.env.Secret,
          { expiresIn: "7d" }
        );
        let saveNewQuiz = new quizModel(req.body.quizSchema);
        saveNewQuiz.save((err, result) => {
          if (err) {
            console.log(err);
            res.send({ message: "unable to create quiz", status: false });
          } else {
            res.send({
              message: "created succesfully",
              status: true,
              classId: jwtClassIdentification,
            });
          }
        });
      }
    }
  });
};

const viewQuiz = (req, res) => {
  let quizId = jwt.sign(
    { class: req.body.class, adminId: req.body.adminId },
    process.env.secret,
    { expiresIn: "7d" }
  );
  res.send({ status: true, identification: quizId });
};

const loadQuizCollection = (req, res) => {
  let idverification = req.headers.authorization.split(" ")[1];
  jwt.verify(idverification, process.env.Secret, (err, result) => {
    if (err) {
      res.send({ message: "jwt malformed", status: false });
    } else {
      quizModel.find({ adminId: result.adminId }, (err, collection) => {
        if (err) {
          res.send({ message: "an error ocurred", status: false });
        } else {
          const currentClassCollection = collection.filter(
            (content) => content.class === result.class
          );
          res.send({
            message: "success",
            status: true,
            collections: currentClassCollection,
            class: result.class,
          });
        }
      });
    }
  });
};

const deleteSpecificQuizCollection = (req, res) => {
  console.log(req.body);
  quizModel.findByIdAndDelete({ _id: req.body.quizId }, (err) => {
    if (err) {
      res.send({
        message: "an error ocurred, unbale to delete",
        status: false,
      });
    } else {
      res.send({ message: "deleted successfully", status: true });
    }
  });
};

const generateTokenForQuiz = (req, res) => {
  const quizId = jwt.sign(
    { quizDataBaseId: req.body.quizDbId },
    process.env.Secret,
    { expiresIn: "7d" }
  );
  res.send({ status: true, quizId: quizId });
};

const getSpecificQuiz = (req, res) => {
  let incomingToken = req.headers.authorization.split(" ")[1];
  jwt.verify(incomingToken, process.env.Secret, (err, token) => {
    if (err) {
      res.send({ message: "jwt malwared", status: false });
    } else {
      quizModel.findOne({ _id: token.quizDataBaseId }, (err, result) => {
        if (err) {
          res.send({ message: "an error ocurred", status: false });
        } else {
          res.send({ message: "success", status: true, currentQuiz: result });
        }
      });
    }
  });
};

const uploadImageForQuiz = (req, res) => {
  console.log(req.body)
  const imageUpload = cloudinary.uploader.upload(req.body.imageUrl, {
    public_id: "olympic_flag",
  });

  imageUpload
    .then((data) => {
      console.log(data);
      console.log();
      res.send({status:true, imgUrl:data.secure_url})
    })
    .catch((err) => {
      if (err) {
        cosole.log(err)
        res.send({ status: false, message: "An error ocurred" });
      }
    });
};

const addQuestion = (req, res) => {
  quizModel.findOne({ _id: req.body.quizId }, (err, result) => {
    if (err) {
      res.send({ message: "an error occured", status: false });
    } else {
      if (result !== null) {
        if (0 > 0) {
          console.log(1);
        } else if (1 > 0) {
          console.log(0);
        }
        // if (
        //   req.body.time.hour > 0 ||
        //   req.body.time.minutes > 0 ||
        //   req.body.time.seconds > 0
        // ) {
          result.quizSubject[req.body.subjectId].time = req.body.time;
        // }

        if (req.body.assignedMark > 1 && req.body.assignedMark !== 1) {
          result.quizSubject[req.body.subjectId].subjectMark =
            req.body.assignedMark;
        }

        if (req.body.replaceAdd === 0) {
          req.body.quizQuestion.map((quiz, id) => {
            result.quizSubject[req.body.subjectId].questions.push(quiz);
          });
        } else if (req.body.replaceAdd === 1) {
          result.quizSubject.map((content, id) => {
            if (content.quizName === req.body.subjectName) {
              content.questions = quizQuestion;
            }
          });
        }

        quizModel.findByIdAndUpdate({ _id: req.body.quizId }, result, (err) => {
          if (err) {
            res.send({ message: "unable to save,try again", status: false });
          } else {
            res.send({ message: "saved succesfully", status: true });
          }
        });
      }
    }
  });
};

module.exports = {
  adminSignUp,
  emailVerification,
  login,
  adminDasboard,

  // quiz creation
  createQuiz,
  viewQuiz,
  loadQuizCollection,
  deleteSpecificQuizCollection,
  generateTokenForQuiz,
  getSpecificQuiz,
  uploadImageForQuiz,
  addQuestion,
};
