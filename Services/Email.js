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
             subject: "Trivy Email Verification",
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
          Click on the button below to verify your email, to be able to access your Trivy account. 
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
              width:98%;
              height:40px;
            "
          >
            <a
              href="https://trivy-dun.vercel.app/verify/${token}"
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
              href="https://trivy-dun.vercel.app/verify/${token}"
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
  static async sendVerifactionMail(adminEmail, token) {
    try {
     
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: `${process.env.Email}`,
          pass: `${process.env.EmailPass}`,
        },
      });
      var mailOption = {
        from: "",
        to: adminEmail,
        subject: `Trivy Forgot Password Reset`,
        text: `hello`,
        html: ` <div style="width:370px; height: 100%; margin:0 auto; position: fixed; top: 0; display: flex; justify-content: center; font-family: sans-serif;">
        <div style="width: 95%;">
             <h1 style="text-align: center; color:#03a26c; ">Trivy</h1>
        <p style="font-size: 0.9rem; line-height: 30px; width: 100%; margin: 0  auto 10px auto; box-sizing: border-box; text-align: justify; padding: 30px 10px; border-radius: 5px;">
          You've requested to reset your forgotten password,
          Click on the button below to rest password.
          <br>
          It expires in 4 hrs.
         </p>
         <div styele="width:300px; margin:0 auto;">
           <a href="https://trivy-dun.vercel.app/reset/password/${token}" style=" text-decoration: none; ">
      
          <button style="background:#03a26c; text-align:center;font-size: 0.8rem;  border:none; width:100%; height:40px;color:white;">
            Reset
   
          </button>
              </a>
         </div>
      

        </div>
       
    </div>`,
      };
      
      const sendMail = await transporter.sendMail(mailOption)
        let message = "Mail sent succesfully"
      return message
    } catch (error) {
      return new Error("An error occured")
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