const adminModel = require("../models/adminModel");
const quizModel = require("../models/QuizQuestionModel");
const playerModel = require("../models/Playersmodel")
const jwt = require("jsonwebtoken");
const SearchResult = require("../Services/searchResult");
const searchAdmin = async (req, res) => {
  console.log(req.body)
  try {
    const search  = await SearchResult.searchAdmin(process.env.SearchIdentification, req.body.name )
    if (search instanceof Error) {
        return res.send({message:search.message, status:false})
    }
   return  res.send({
               message: "userFound",
               status: true,
               userFound: search,
             });
           
  } catch (error) {
    return res.send({ message:"an error occured", status: false });
  }
    // adminModel.find({ searchId: process.env.SearchIdentification }, (err, result) => {
    //   if (err) {
    //     res({ message: "an error occured", state: false });
    //   } else {
    //     console.log(result);
    //     if (result.length > 0) {
    //       let userFound = result.filter( (admin, id) => admin.adminUserName.toUpperCase().indexOf(req.body.name.toUpperCase()) > -1 );
    //       console.log(userFound, "this is the user found");
    //       if (userFound.length > 0) {
    //          res.send({
    //            message: "userFound",
    //            status: true,
    //            userFound: userFound,
    //          });
           
    //       } else {
    //         res.send({
    //           message: "no userfound",
    //           status: false,
    //           userFound: userFound,
    //         });
    //       }
    //     } else {
    //       res.send({ status: false, message: "no user found" });
    //     }
    //   }
    // });
}

const jwtAdminId = (req, res) => {
    let id = jwt.sign({ adminID:req.body.adminId  }, process.env.secret, { expiresIn: "7d" })
    res.send({ message:"saved", status:true, identification:id})
}


const getAdminDetails = async (req, res) => {
  try {
    let adminIdVerification = req.headers.authorization.split(" ")[1];
    const verifyToken = jwt.verify(adminIdVerification, process.env.secret)
    const adminModel = await adminModel.findOne({ _id: verifyToken.adminID })
    return res.send({ Message: "admin found", status: true, admin: adminModel });  
    
  } catch (error) {
    
  }
//     let adminIdVerification = req.headers.authorization.split(" ")[1]
//     jwt.verify(adminIdVerification, process.env.secret, (err, result) => {
       
//         if (err) {
//          res.send({message:"an eror ocurred", status:false})
//         } else {
//             console.log(result)
//             adminModel.findOne({ _id: result.adminID }, (err, result) => {
//                 if (err) {
//                res.send({message:"an error occured", status:false})
//                 } else {
//                  if (result !== null) {
//                    console.log(result)
//                  res.send({Message:"admin found", status:true, admin:result})   
//              }
//            }
//        })
//      }
//  })
    
}


const searchCollection = async (req, res) => {
  try {
    const searchCollection = await SearchResult.searchCollection(req.body)
    if (searchCollection instanceof Error) {
       return res.send({ message: searchCollection.message, status: true,});  
    }
    return res.send({ message: "result found", status: true, userFound:searchCollection })
  } catch (error) {
     return res.send({ message:"an error occured", status: true }); 
  }
    // quizModel.find({ adminId: req.body.adminId }, (err, result) => {
    //     if (err) {
    //         res.send({message:"an error occured", status:false})
    //     } else {
    //         if (result.length > 0) {
    //             let setCollection = result.filter((quizCollection) => quizCollection.class === req.body.class)
    //             if (setCollection.length > 0) {
    //                 let collectionLookedFor = setCollection.filter((col) => col.quizName.toUpperCase().indexOf(req.body.data.toUpperCase()) > -1)
    //                 if (collectionLookedFor.length > 0) {
    //                  res.send({ message: "result found", status: true, userFound:collectionLookedFor });
    //                 } else {
    //                      res.send({ message: "no result found", status: false });
    //             }
    //             } else {
    //                  res.send({ message: "no result found", status: false });
    //             }
    //         } else {
    //             res.send({message:"no result found", status:false})
    //         }
    //     }
    // })

}

const findQuizPlayed = async (req, res) => {
  try {
    const gamePlayed = await SearchResult.findQuizPlayed(req.body);
    if (gamePlayed instanceof Error) {
      res.send({ message:gamePlayed.message, status: false });
    }
    return res.send({ message: "result found", status: true, gamePlayedResult:gamePlayed });
  } catch (error) {
    return res.send({message:"na error occured", status:false})
    
  }
  // quizModel.findOne({ _id: req.body.quizId }, (err, result) => {
  //   if (err) {
  //     res.send({message:"an error occured", status:false})
  //   } else {
  //     if (result !== null) {
  //       const collectionResultFunction = () => {
  //           playerModel.find({quizId:req.body.quizId}, (err, result)=>{
  //           if (err) {
  //             res.send({message:"an error ocurred", status:false})
  //           } else {
  //             if (result.length > 0) {
  //               let gamePlayed = result.filter((res) => res.result.length > 0)
  //               if (gamePlayed.length > 0) {
                  
  //                     res.send({ message: "No result found", status: true, gamePlayedResult:gamePlayed });
  //               } else {
  //                    res.send({ message: "No result found", status: false }); 
  //               }
                
  //             } else {
  //               res.send({message:"No result found", status:false})
  //             }
  //           }
  //         })
  //       }
      

  //       if ( req.body.locked === "yes") {
  //         console.log(req.body)
  //         if (result.quizResultAcessPassword === req.body.acessPass) {
  //            collectionResultFunction()
  //          } else {
  //            res.send({ message: "Invalid Password", status: false });
  //          }
  //       } else if (req.body.locked === "no") {
  //         collectionResultFunction()
  //       }
       
  //     }
  //   }
  // })

}



















module.exports = {
  searchAdmin,
  jwtAdminId,
  getAdminDetails,
  searchCollection,
  findQuizPlayed,
};