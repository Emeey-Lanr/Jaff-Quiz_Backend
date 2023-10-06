
const quizModel = require("../models/QuizQuestionModel");
const playerModel = require("../models/Playersmodel")
const jwt = require("jsonwebtoken");
const SearchResult = require("../Services/searchResult");
const adminModel = require("../models/adminModel");
const searchAdmin = async (req, res) => {

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
        return res.status(404).send({ message:"an error occured", status: false });
  }

    
}


const searchCollection = async (req, res) => {
  try {
    const searchCollection = await SearchResult.searchCollection(req.body)
    if (searchCollection instanceof Error) {
       return res.send({ message: searchCollection.message, status: false});  
    }
    return res.send({ message: "result found", status: true, userFound:searchCollection })
  } catch (error) {
     return res.send({ message:"an error occured", status: true }); 
  }


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
 

}



















module.exports = {
  searchAdmin,
  jwtAdminId,
  getAdminDetails,
  searchCollection,
  findQuizPlayed,
};