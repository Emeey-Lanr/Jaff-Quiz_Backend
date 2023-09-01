const nodemailer = require("nodemailer")
const { signUpEmail } = require("../Utilis/email")
var generator = require("generate-password");
var ID = require("nodejs-unique-numeric-id-generator");
class AdminEmail {
    static async signup(token, email) {
        try {
               var transporter = nodemailer.createTransport({
                      service: "gmail",
                      auth: {
                        user:`${process.env.Email}`,
                        pass: `${process.env.EmailPass}`,
                      },
                    });

           var mailOptions = {
             from: "",
             to: email,
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
        <p style="text-align: center; color: #757575; font-family: sans-serif; font-size:0.8rem;">
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
              href="http://localhost:3000/verify/${token}"
              style="color: white; text-decoration: none; font-family: san-serif;" 
              >Verify</a
            >
          </button>
        </div>
      </div>
    </div>`,
           };
          
         const sendMail =  await transporter.sendMail(mailOptions)
            
        } catch (error) {
        
         return new Error(error.message)   
        }
        
  }
  static async login(token) {
    try {
       var transporter = nodemailer.createTransport({
         service: "gmail",
         auth: {
           user: `${process.env.Email}`,
           pass: `${process.env.EmailPass}`,
         },
       });

       var mailOptions = {
         from: "",
         to: email,
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
              href="http://localhost:3000/verify/${token}"
              style="color: white; text-decoration: none; font-family: cursive;" 
              >Verify</a
            >
          </button>
        </div>
      </div>
    </div>`,
       };
    
       const sendMail = await transporter.sendMail(mailOptions);
    } catch (error) {
      
    }
     
  }
  static async createQuizPasswordId(numberToBeGenerated, multiple) {
    try {
      const id = ID.generate(new Date().toJSON());
      if (multiple) {
         const passwordMutiple = generator.generateMultiple(
           numberToBeGenerated,
           {
             length: 6,
             upperCase: false,
             numbers: true,
           }
        );
        return { pass: passwordMutiple, id }
      } 

        
         const singlePassword = generator.generateMultiple(1, {
           length: 6,
           uppercase: true,
           numbers: true,
         });
      return { pass: singlePassword, id }
    } catch (error) {
      
    }
  }
}



module.exports = AdminEmail