const adminModel = require("../models/adminModel");
const nodemailer = require("nodemailer");
const quizModel = require("../models/QuizQuestionModel");
const playerModel = require("../models/Playersmodel")
const jwt = require("jsonwebtoken");
var ID = require("nodejs-unique-numeric-id-generator");
var generator = require("generate-password");
const cloudinary = require("cloudinary").v2;
const ShortUniqueId = require('short-unique-id')
const Admin = require('../Services/admin');
const AdminValidation = require("../Validators/admin");

const {errorResponse, sucessResponse} = require("../response/errorSuccess")
cloudinary.config({
  cloud_name: process.env.Cloudinary_cloud_name,
  api_key: process.env.Cloudinary_api_key,
  api_secret: process.env.Cloudinary_api_secret,
});
const falseStatus = false;
const trueStatus = true;

const adminSignUp = async (req, res) => {
  try {
    const registerUser = await Admin.signup(req.body)
    if (registerUser instanceof Error) {
     return res.status(400).send({status:false, message:registerUser.message}) 
    }
    return res.status(200).send({status:true, message:registerUser.mail})
  } catch (error) {
    console.log(error)
    return errorResponse(res, 500, error.message, false);
  }
 

};

// verify mail
const emailVerification = async (req, res) => {
  try {
    const emailTokenVerification = await Admin.emailVerification(req.headers.authorization.split(" ")[1])
    if (emailTokenVerification instanceof Error) {
      return res.send({message:emailTokenVerification.message, status:false})
    }
    return res.send({message:"verfied", status:true, adminId:emailTokenVerification})
  } catch (error) {
    console.log(error)
    return res.send({message:error.message, status:false})
  }
 
};

const login =  async (req, res) => {
  console.log(req.body);
  try {
    const loginVerification = await Admin.login(req.body.userName, req.body.password)
    if (loginVerification instanceof Error) {
      return res.send({message:loginVerification.message})
    }
    if (!loginVerification.state) {
      return res.send({mailStatus:true})
    }
    return res.send({ message: "success", status: true, adminId: loginVerification.token });
    
  } catch (error) {
    return res.send({message:error.message, status:false})
  }

 
};

const adminDasboard = async (req, res) => {
  try {
    let adminId = req.headers.authorization.split(" ")[1];
    const admin  = await Admin.adminDasboard(`${adminId}`)
  
    if (admin instanceof Error) {
      console.log(admin.message)
      return errorResponse(res, 400, admin.message, false)
    }
    console.log(admin.ranking,  admin.player[0].result)

  return res.send(
    JSON.stringify({
      message: "success",
      status: true,
      adminDetails: admin.admin,
      quizDetails: admin.player,
      lastQuizheld: admin.order,
      ranking: admin.ranking,
    })
  );
  } catch (error) {
    console.logg(error.message)
    return errorResponse(res, 500, "an error occured", false)
  }

};

// Upload Setting Image
// Not tested
const uploadSettingImage = async (req, res) => {
  try {
    const imageUpload = await Admin.uploadImage(req.body.imageUrl, req.body.adminId)
    if (imageUpload instanceof Error) {
      return res.status(400).send({message:imageUpload.message, status:false})
    }
    return res.status(200).send({message:"Uploaded succesfuuly", status:true})
    
  } catch (error) {
    return res.status(500).send({message:error.message, status:false})
  }


}
// /quiz creation

const createQuiz = async (req, res) => {
  try {
    const newQuiz = await Admin.createQuiz(req.body)
    if (newQuiz instanceof Error) {
      return res.send({mesage:newQuiz.message, status:false})
    }
    return res.status(200).send({message:"created succesfully", status:true, classId:newQuiz.token, data:newQuiz.newQuiz})
  } catch (error) {
          return res.send({mesage:"an error occured", status:false})
  }
  
};

const viewQuiz = async (req, res) => {
  try {
     let quizId =  jwt.sign(
       { class: req.body.class, adminId: req.body.adminId },
       process.env.secret,
       { expiresIn: "7d" }
     );
     res.status(200).send({ status: true, identification: quizId });
  } catch (error) {
    
  }
 
};

const loadQuizCollection = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log("here")
    const loadQuiz = await Admin.loadQuizColection(token);
    if (loadQuiz instanceof Error) {
      return res.status(404).send({ status: true, message:loadQuiz.message });
    }
    return res.send(
       
      { message: "success",
      status: true, 
      collections: loadQuiz.collection,
            class: loadQuiz.class,
          });

  } catch (error) {
    
  }

};

const deleteQuestion = async (req, res) => {
  try {
    const deleteQuestion = await Admin.deleteQuestion(req.body) 
    if (deleteQuestion instanceof Error) {
      return errorResponse(res, 400, `unable to delete`, false)
    }
    return sucessResponse(res, 200, `Deleted`, false);
  } catch (error) {
    return errorResponse(res, 500, error.message, true)
  }
 
  
}
const editQuestion = async (req, res) => {
  try {
 console.log(req.body)
    const editQuestion = await Admin.editQuestion(req.body)
    if (editQuestion instanceof Error) {
       return errorResponse(res, 400, error.message, false);
    }
        return sucessResponse(res, 200, `Edited Succesfully`, false);
  } catch (error) {
    return errorResponse(res, 500, error.message, false )
  }
 
}
const generateMorePassword = async (req, res) => {
  console.log(req.body)
  try {
     const generate = await Admin.generateMorePassword(req.body)
    if (generate instanceof Error) {
      return errorResponse(res, 400, generate.message, false)
    }
    return sucessResponse(res, 200, "generated succesfully", true)
  } catch (error) {
    return errorResponse(res, 400, error.message, false);
  }
 
  
}
const quizAcessPassword = async (req, res) => {
  try {
    const addQuizAcessPassword = await Admin.quizAcessPassword(req.body)
    if (addQuizAcessPassword instanceof Error) {
      return errorResponse(res, 400, addQuizAcessPassword.message, false)
    }
    return sucessResponse(res, 200, "updated sucessfully", true)
  } catch (error) {
          return errorResponse(res, 400, error.message, false);
  }
  

}

const removeQuizAcessPassword = async (req, res) => {
  try {
    const remove = await Admin.removeQuizAcessPaasowrd(req.body)
    if (remove instanceof Error) {
      return errorResponse(res, 400, remove.message, false)
    }
    return sucessResponse(res, 200, "removed succesfully", true)
  } catch (error) {
     return errorResponse(res, 400, error.message, false);
  }

 
}

const deleteSpecificQuizCollection = async (req, res) => {
  try {
    console.log("delete")
    const deleteQuiz = await Admin.deleteSpecificQuizCollection(req.body)
    if (deleteQuiz instanceof Error) {
      return errorResponse(res, 400, deleteQuiz.message, false)
    }
    return sucessResponse(res, 200, "deleted succesfully", true)
  } catch (error) {
    return errorResponse(res, 400, error.message, false);
  }

};

const generateTokenForQuiz = (req, res) => {
  const quizId = jwt.sign(
    { quizDataBaseId: req.body.quizDbId },
    process.env.Secret,
    { expiresIn: "7d" }
  );
  res.send({ status: true, quizId: quizId });
};

const getSpecificQuiz = async (req, res) => {
  try {
    const incomingToken = req.headers.authorization.split(" ")[1];
    console.log(incomingToken, "kjhgfds")
    const getQuiz = await Admin.getSpecificQuiz(incomingToken)
    if (getQuiz instanceof Error) {
           return errorResponse(res, 400, getQuiz.message, false);
    }
    return res.send({ message: "success", status: true, currentQuiz: getQuiz });

  } catch (error) {
    return errorResponse(res, 400, error.message, false);
  }

};

const uploadImageForQuiz = (req, res) => {
    const uid = new ShortUniqueId()
  const uidWithTimestamp = uid.stamp(20)
  const imageUpload = cloudinary.uploader.upload(req.body.imageUrl, {
    public_id: uidWithTimestamp,
  });

  imageUpload
    .then((data) => {
      res.send({status:true, imgUrl:data.secure_url})
    })
    .catch((err) => {
      if (err) {
        cosole.log(err)
        res.send({ status: false, message: "An error ocurred" });
      }
    });
};

const addQuestion = async (req, res) => {
  try {
   console.log("hehhjkjhgfr")
    const add = await Admin.addQuestion(req.body)

    if (add instanceof Error) {
      return errorResponse(res, 400, add.message, false)
    }
    return sucessResponse(res, 200, "created sucesffully", true )
  } catch (error) {
    return errorResponse(res, 400, error.mesage, false)
  }
  
};



// checkParticipants
const checkParticiPants = async (req, res) => {
  try {
    const userToken = req.headers.authorization.split(" ")[1]
    const check = await Admin.checkParticiPants(userToken);
    if (check instanceof Error) {
      return errorResponse(res, 400, check.message, )
    }
   return res.send({ message: "succesful", status: true, result: JSON.stringify(check) });
    console.log(check)
  } catch (error) {
    return errorResponse(res, 500, "an error occured", false)
  }

  
}

// DeleteQuiz
const deleteQuiz = async (req, res) => {
  try {
    const deleteQuiz = await Admin.deleteQuiz(req.body);
    if (deleteQuiz instanceof Error) {
      return res.send({ message: "unable to delete", status: false });
    }
    return res.send({ message: "deleted succesfully", status: true });
  } catch (error) {
    return res.send({ message: "unable to delete", status: false });
  }


  // playerModel.findByIdAndDelete({ _id: req.body.quizId }, (err) => {
  //   if (err) {
  //     res.send({message:"unable to delete", status:false})
  //   } else {
  //     res.send({message:"deleted succesfully", status:true})
  //   }
  // })
}
module.exports = {
  adminSignUp,
  emailVerification,
  login,
  adminDasboard,
uploadSettingImage,
  // quiz creation
  createQuiz,
  viewQuiz,
  loadQuizCollection,
  deleteQuestion,
  editQuestion,
  generateMorePassword,
  quizAcessPassword,
  removeQuizAcessPassword,
  deleteSpecificQuizCollection,
  generateTokenForQuiz,
  getSpecificQuiz,
  uploadImageForQuiz,
  addQuestion,
  checkParticiPants,
  deleteQuiz,

};
