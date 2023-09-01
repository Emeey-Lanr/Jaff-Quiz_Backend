
const quizModel = require("../models/QuizQuestionModel");
const playerModel = require("../models/Playersmodel")
const jwt = require("jsonwebtoken");
const SearchResult = require("../Services/searchResult");
const adminModel = require("../models/adminModel");
const searchAdmin = async (req, res) => {
  console.log(req.body.name)
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
  
}

const jwtAdminId = (req, res) => {
    let id = jwt.sign({ adminID:req.body.adminId  }, process.env.secret, { expiresIn: "7d" })
    res.send({ message:"saved", status:true, identification:id})
}


const getAdminDetails = async (req, res) => {
  try {
    let adminIdVerification = req.headers.authorization.split(" ")[1];

    const verifyToken =  jwt.verify(adminIdVerification, process.env.secret)
    
    const admin = await  adminModel.findOne({ _id: verifyToken.adminID })
    
    return res.send({ Message: "admin found", status: true,  admin });  
    
  } catch (error) {
    console.log(error.message)
  }

    
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
       return res.send({ message:gamePlayed.message, status: false });
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