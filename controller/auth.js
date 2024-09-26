const express = require("express");
const moment = require('moment');
const Event = require("../model/event");
const Customer = require("../model/customer");
const Packageplan = require("../model/packageplan");
const Organizer = require("../model/organizer");
const Subscribe = require("../model/subscribe");
const Admin = require("../model/admin");
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const sendToken = require("../utils/jwtToken");
const { Mindate, Imgurl, mailFooter, AdminEmail, mailHeader } = require("../utils/Helper");

// customer
router.post("/customer/signup", async (req, res, next) => {
    try {
        const { hobbies, first_name, last_name, email, phone_number, area_code, whatsapp_no, address, city, state, country, cityvalue, statevalue, countryvalue, pincode, agree_to_terms, agree_to_receive_marketing, password } = req.body;
        const name = first_name + ' ' + last_name;
        if (!first_name) {
            return next(new ErrorHandler("First name is require", 400));
        }
        if (!last_name) {
            return next(new ErrorHandler("Last name is require", 400));
        }
        if (!email) {
            return next(new ErrorHandler("Email is require", 400));
        }
        if (!phone_number) {
            return next(new ErrorHandler("Phone number is require", 400));
        }
        if (!password) {
            return next(new ErrorHandler("Password is require", 400));
        }
        const checkEmail = await Customer.findOne({ email, isdelete: 0 });
        if (checkEmail) {
            return next(new ErrorHandler("Email already exist", 400));
        }
        const login_type = "Email";
        const result = await Customer.create({
            name,
            wallet: 0,
            login_type,
            first_name,
            last_name,
            email,
            hobbies,
            phone_number,
            area_code,
            whatsapp_no,
            address,
            city,
            state,
            country,
            cityvalue,
            statevalue,
            countryvalue,
            pincode,
            agree_to_terms,
            agree_to_receive_marketing,
            password,
            date: Mindate,
            isdelete: 0
        });
        if (agree_to_receive_marketing == 1) {
            const check = await Subscribe.findOne({ email });
            if (!check) {
                await Subscribe.create({ name, email });
            }
        }
        const packagePlanList = await Packageplan.find({ isdelete: 0 });
        let eligiblePackagePlan;
        for (const plan of packagePlanList) {
            const planAmount = parseInt(plan.purchase_amount);
            if (planAmount <= 0 && (!eligiblePackagePlan || planAmount > parseInt(eligiblePackagePlan.purchase_amount))) {
                eligiblePackagePlan = plan;
            }
        }
        if (eligiblePackagePlan) {
            const update = await Customer.updateOne({ _id: result.id }, {
                planid: eligiblePackagePlan._id,
                plan_name: eligiblePackagePlan.name,
                plan_amount: eligiblePackagePlan.purchase_amount,
                plan_discount: eligiblePackagePlan.discount_amount,
            });
        }
        // res.status(201).json({
        //     success: true,
        //     userid: result
        // });
        const Userdata = await Customer.findOne({ email });
        sendToken(Userdata, 200, res);

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/customer/signup-a", async (req, res, next) => {
    try {
        const { first_name, last_name, email, phone_number, password,
            whatsapp_no,
            country,
            countryvalue,
            marketing
        } = req.body;
        const name = first_name + ' ' + last_name;
        if (!first_name) {
            return next(new ErrorHandler("First name is require", 400));
        }
        if (!last_name) {
            return next(new ErrorHandler("Last name is require", 400));
        }
        if (!email) {
            return next(new ErrorHandler("Email is require", 400));
        }
        if (!phone_number) {
            return next(new ErrorHandler("Phone number is require", 400));
        }
        if (!password) {
            return next(new ErrorHandler("Password is require", 400));
        }
        const checkEmail = await Customer.findOne({ email });
        if (checkEmail) {
            return next(new ErrorHandler("An account with this Email ID already exists. Please use another Email ID.", 400));
        }
        const login_type = "Email";
        const result = await Customer.create({
            name,
            wallet: 0,
            login_type,
            is_comingsoon: 1,
            first_name,
            last_name,
            email,
            phone_number,
            agree_to_terms: 1,
            agree_to_receive_marketing: marketing ? 1 : 0,
            password,
            date: Mindate,
            whatsapp_no,
            country,
            countryvalue,
            isdelete: 0
        });
        if (marketing) {
            const checkNewsletter = await Subscribe.findOne({ email });
            if (!checkNewsletter) {
                await Subscribe.create({ name, email });
            }
        }
        const Userdata = await Customer.findOne({ email });
        sendToken(Userdata, 200, res);

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/customer/login-as-guest", async (req, res, next) => {
    try {
        const { email, fname, lname, phonenumber } = req.body;
        const CheckEmail = await Customer.findOne({ email });
        if (CheckEmail && CheckEmail.login_type != "Guest") {
            return next(new ErrorHandler("This email is registered with an existing account. Please login as a customer", 400));
        }
        if (!CheckEmail) {
            const Store = await Customer.create({
                name: fname + ' ' + lname,
                first_name: fname,
                last_name: lname,
                phone_number: phonenumber,
                email: email,
                login_type: "Guest",
                isdelete: 0
            });
        }
        const result = await Customer.findOne({ email });
        sendToken(result, 200, res);
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }

});
router.post("/organizer/email-check", async (req, res, next) => {
    try {
        const { email } = req.body;

        const checkEmail = await Organizer.findOne({ email, isactive: 0 });
        if (checkEmail) {
            return next(new ErrorHandler("Email already exist", 400));
        } else {
            res.status(201).json({
                success: true,
                data: 1
            });
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/customer/email-check", async (req, res, next) => {
    try {
        const { email } = req.body;

        const checkEmail = await Customer.findOne({ email, isactive: 0 });
        if (checkEmail) {
            return next(new ErrorHandler("Email already exist", 400));
        } else {
            res.status(201).json({
                success: true,
                data: 1
            });
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/customer/login-google", async (req, res, next) => {
    try {
        const { email, name, profilepic } = req.body;
        if (!email) {
            return next(new ErrorHandler("Email is require", 400));
        }
        const checkEmail = await Customer.findOne({ email });
        if (checkEmail) {
            sendToken(checkEmail, 200, res);
        } else {
            const result = await Customer.create({
                name,
                wallet: 0,
                login_type: "Google",
                email,
                picture: profilepic,
                agree_to_terms: 1,
                agree_to_receive_marketing: 1,
                date: Mindate
            });
            const getuser = await Customer.findOne({ email });
            sendToken(getuser, 200, res);
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.get("/send-email", async (req, res, next) => {
  
    try {
        const emailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ticket Confirmation</title>
<style>
body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    margin: 0;
    padding: 0;
}
.container {
    max-width: 600px;
    margin: 20px auto;
    background: #ffffff;
    padding: 20px;
}
.header {
    background-color: #f8f8f8;
    padding: 10px;
    text-align: center;
    border-bottom: 1px solid #ddd;
}
.content {
    padding: 10px 20px;
    text-align: left;
}
.footer {
    background-color: #f8f8f8;
    padding: 10px;
    text-align: center;
    border-top: 1px solid #ddd;
}
.ticket-details {
    margin: 20px 0;
    padding: 10px;
    background-color: #f9f9f9;
    border: 1px solid #e9e9e9;
    display: flex;
    align-items: center;
}
.ticket-details img {
    max-width: 265px;
    margin-right: 20px;
}
.ticket-details div {
    flex-grow: 1;
}
.highlight {
    color: #e53238;
    font-weight: bold;
}
</style>
</head>
<body>
<div class="container">
    <div class="header">
        <h2>Ticket Confirmation</h2>
    </div>
    <div class="content">
        <p>Hello John Doe,</p>
        <p>Thank you for your purchase. Here are the details of your ticket:</p>
        
        <div class="ticket-details">
            <img src="https://tixme.co/tixme_storage/storage/app/public/ScpNdaJD6U.jpeg" alt="Ticket Image">
            <div>
                <p><strong>Name:</strong> John Doe</p>
                <p><strong>Address:</strong> 123 Main Street, City</p>
                <p><strong>Date:</strong> January 15, 2024</p>
                <p><strong>Time:</strong> 7:00 PM</p>
                <p><strong>Price:</strong> $25.00</p>
                <p><strong>Quantity:</strong> 2</p>
                <!-- You can add more details here -->
            </div>
        </div>

        <p>If you have any questions or concerns, please contact our support team.</p>

        <p>Regards,<br>TIXME</p>
    </div>
    <div class="footer">
        <p>&copy; 2024 TIXME. All rights reserved.</p>
    </div>
</div>
</body>
</html>
`;
        const fuk = await sendMail({
            email: "simrantokhi@gmail.com",
            subject: "Password Reset Request",
            message: emailTemplate,
            isHtml: true, // Set this to true to indicate that the message is in HTML format
        });
        res.status(201).json({
            success: true,
            message: fuk
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/customer/reset-password", async (req, res, next) => {
    try {
        const { email } = req.body;
        const Imgurl = 'https://tixme.co/tixme_storage/storage/app/public/';
        const check = await Customer.findOne({ email });
        if (check) {
            const otp = Math.floor(100000 + Math.random() * 900000);
            const userName = check.name; // Replace with the actual user's name
            const htmlMessage = `<!DOCTYPE html>
            <html >
            <head>
              <meta charset="UTF-8">
              <title> Forgot password?</title>
            </head>
            
            <body>
              <head>
              <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
              <!--[if !mso]><!-->
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <!--<![endif]-->
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title></title>
              <!--[if !mso]><!-->
              <style type="text/css">
                @font-face {
                          font-family: 'flama-condensed';
                          font-weight: 100;
                          src: url('http://assets.vervewine.com/fonts/FlamaCond-Medium.eot');
                          src: url('http://assets.vervewine.com/fonts/FlamaCond-Medium.eot?#iefix') format('embedded-opentype'),
                                url('http://assets.vervewine.com/fonts/FlamaCond-Medium.woff') format('woff'),
                                url('http://assets.vervewine.com/fonts/FlamaCond-Medium.ttf') format('truetype');
                      }
                      @font-face {
                          font-family: 'Muli';
                          font-weight: 100;
                          src: url('http://assets.vervewine.com/fonts/muli-regular.eot');
                          src: url('http://assets.vervewine.com/fonts/muli-regular.eot?#iefix') format('embedded-opentype'),
                                url('http://assets.vervewine.com/fonts/muli-regular.woff2') format('woff2'),
                                url('http://assets.vervewine.com/fonts/muli-regular.woff') format('woff'),
                                url('http://assets.vervewine.com/fonts/muli-regular.ttf') format('truetype');
                        }
                      .address-description a {color: #000000 ; text-decoration: none;}
                      @media (max-device-width: 480px) {
                        .vervelogoplaceholder {
                          height:83px ;
                        }
                      }
              </style>
              <!--<![endif]-->
              <!--[if (gte mso 9)|(IE)]>
                <style type="text/css">
                    .address-description a {color: #000000 ; text-decoration: none;}
                    table {border-collapse: collapse ;}
                </style>
                <![endif]-->
            </head>
            
            <body bgcolor="#e1e5e8" style="margin-top:0 ;margin-bottom:0 ;margin-right:0 ;margin-left:0 ;padding-top:0px;padding-bottom:0px;padding-right:0px;padding-left:0px;background-color:#e1e5e8;">
              <!--[if gte mso 9]>
            <center>
            <table width="600" cellpadding="0" cellspacing="0"><tr><td valign="top">
            <![endif]-->
              <center style="width:100%;table-layout:fixed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#e1e5e8;">
                <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;">
                  <table align="center" cellpadding="0" style="border-spacing:0;font-family:'Muli',Arial,sans-serif;color:#333333;Margin:0 auto;width:100%;max-width:600px;">
                    <tbody>
                      <tr>
                        <td align="center" class="vervelogoplaceholder" height="143" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;height:143px;vertical-align:middle;" valign="middle"><span class="sg-image" data-imagelibrary="%7B%22width%22%3A%22160%22%2C%22height%22%3A34%2C%22alt_text%22%3A%22Verve%20Wine%22%2C%22alignment%22%3A%22%22%2C%22border%22%3A0%2C%22src%22%3A%22https%3A//marketing-image-production.s3.amazonaws.com/uploads/79d8f4f889362f0c7effb2c26e08814bb12f5eb31c053021ada3463c7b35de6fb261440fc89fa804edbd11242076a81c8f0a9daa443273da5cb09c1a4739499f.png%22%2C%22link%22%3A%22%23%22%2C%22classes%22%3A%7B%22sg-image%22%3A1%7D%7D"><a href="#" target="_blank"><img alt="Verve Wine" height="34" src="${'https://tixme.co/tixme_storage/storage/app/public/applogo/tixmeoriginlogo.png'}" style="border-width: 0px; width: 160px; height: auto;" width="160"></a></span></td>
                      </tr>
                      <!-- Start of Email Body-->
                      <tr>
                        <td class="one-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;background-color:#ffffff;">
                          <!--[if gte mso 9]>
                                <center>
                                <table width="80%" cellpadding="20" cellspacing="30"><tr><td valign="top">
                                <![endif]-->
                          <table style="border-spacing:0;" width="100%">
                            <tbody>
                              <tr>
                                <td align="center" class="inner" style="padding-top:15px;padding-bottom:15px;padding-right:30px;padding-left:30px;" valign="middle"><span class="sg-image" data-imagelibrary="%7B%22width%22%3A%22255%22%2C%22height%22%3A93%2C%22alt_text%22%3A%22Forgot%20Password%22%2C%22alignment%22%3A%22%22%2C%22border%22%3A0%2C%22src%22%3A%22https%3A//marketing-image-production.s3.amazonaws.com/uploads/35c763626fdef42b2197c1ef7f6a199115df7ff779f7c2d839bd5c6a8c2a6375e92a28a01737e4d72f42defcac337682878bf6b71a5403d2ff9dd39d431201db.png%22%2C%22classes%22%3A%7B%22sg-image%22%3A1%7D%7D"><img alt="Forgot Password" class="banner" height="93" src="${'https://tixme.co/tixme_storage/storage/app/public/applogo/3293465.jpg'}" style="border-width: 0px; margin-top: 30px; width: 255px; height: auto;" width="255"></span></td>
                              </tr>
                              <tr>
                                <td class="inner contents center" style="padding-top:15px;padding-bottom:15px;padding-right:30px;padding-left:30px;text-align:left;">
                                  <center>
                                    <p class="h1 center" style="Margin:0;text-align:center;font-family:'flama-condensed','Arial Narrow',Arial;font-weight:100;font-size:30px;Margin-bottom:26px;">Forgot your password?</p>
                                    <!--[if (gte mso 9)|(IE)]><![endif]-->
            
                                    <p class="description center" style="font-family:'Muli','Arial Narrow',Arial;Margin:0;text-align:center;max-width:320px;color:#a1a8ad;line-height:24px;font-size:15px;Margin-bottom:10px;margin-left: auto; margin-right: auto;"><span style="color: rgb(161, 168, 173); font-family: Muli, &quot;Arial Narrow&quot;, Arial; font-size: 15px; text-align: center; background-color: rgb(255, 255, 255);">That's okay, it happens! Please note that this code is valid for one-time use only. Do not share this code with anyone for security reasons.</span></p>
                                    <div style="text-align: center;">
    <span style="background-color: black; color: white; font-size: 24px; letter-spacing: 5px; padding: 5px 20px;">${otp}</span>
</div>

                                    <!--[if (gte mso 9)|(IE)]><br>&nbsp;<![endif]--></center>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <!--[if (gte mso 9)|(IE)]>
                                </td></tr></table>
                                </center>
                                <![endif]-->
                        </td>
                      </tr>
                      <!-- End of Email Body-->
                      <!-- whitespace -->
                      <tr>
                        <td height="40">
                          <p style="line-height: 40px; padding: 0 0 0 0; margin: 0 0 0 0;">&nbsp;</p>
            
                          <p>&nbsp;</p>
                        </td>
                      </tr>
                      <!-- Social Media -->
                      <tr>
                        <td align="center" style="padding-bottom:0;padding-right:0;padding-left:0;padding-top:0px;" valign="middle"><span class="sg-image" data-imagelibrary="%7B%22width%22%3A%228%22%2C%22height%22%3A18%2C%22alt_text%22%3A%22Facebook%22%2C%22alignment%22%3A%22%22%2C%22border%22%3A0%2C%22src%22%3A%22https%3A//marketing-image-production.s3.amazonaws.com/uploads/0a1d076f825eb13bd17a878618a1f749835853a3a3cce49111ac7f18255f10173ecf06d2b5bd711d6207fbade2a3779328e63e26a3bfea5fe07bf7355823567d.png%22%2C%22link%22%3A%22%23%22%2C%22classes%22%3A%7B%22sg-image%22%3A1%7D%7D"><a href="https://www.facebook.com/profile.php?id=61556603844279" target="_blank"><img alt="Facebook" height="18" src="${Imgurl + 'social/facebook.png'}" style="border-width: 0px; margin-right: 21px; margin-left: 21px; width: 20px; height: auto;" width="8"></a></span>
                          <!--[if gte mso 9]>&nbsp;&nbsp;&nbsp;<![endif]--><span class="sg-image" data-imagelibrary="%7B%22width%22%3A%2223%22%2C%22height%22%3A18%2C%22alt_text%22%3A%22Twitter%22%2C%22alignment%22%3A%22%22%2C%22border%22%3A0%2C%22src%22%3A%22https%3A//marketing-image-production.s3.amazonaws.com/uploads/6234335b200b187dda8644356bbf58d946eefadae92852cca49fea227cf169f44902dbf1698326466ef192bf122aa943d61bc5b092d06e6a940add1368d7fb71.png%22%2C%22link%22%3A%22%23%22%2C%22classes%22%3A%7B%22sg-image%22%3A1%7D%7D"><a href="https://www.instagram.com/tixme.co" target="_blank"><img alt="Twitter" height="18" src="${Imgurl + 'social/instagram.png'}" style="border-width: 0px; margin-right: 16px; margin-left: 16px; width: 20px; height: auto;" width="23"></a></span>
                          <!--[if gte mso 9]>&nbsp;&nbsp;&nbsp;&nbsp;<![endif]--><span class="sg-image" data-imagelibrary="%7B%22width%22%3A%2218%22%2C%22height%22%3A18%2C%22alt_text%22%3A%22Instagram%22%2C%22alignment%22%3A%22%22%2C%22border%22%3A0%2C%22src%22%3A%22https%3A//marketing-image-production.s3.amazonaws.com/uploads/650ae3aa9987d91a188878413209c1d8d9b15d7d78854f0c65af44cab64e6c847fd576f673ebef2b04e5a321dc4fed51160661f72724f1b8df8d20baff80c46a.png%22%2C%22link%22%3A%22%23%22%2C%22classes%22%3A%7B%22sg-image%22%3A1%7D%7D"><a href="https://www.linkedin.com/company/tixme-co" target="_blank"><img alt="Instagram" height="18" src="${Imgurl + 'social/linkedin.png'}" style="border-width: 0px; margin-right: 16px; margin-left: 16px; width: 20px; height: auto;" width="18"></a></span></td>
                      </tr>
                      <!-- whitespace -->
                      <tr>
                        <td height="25">
                          <p style="line-height: 25px; padding: 0 0 0 0; margin: 0 0 0 0;">&nbsp;</p>
            
                          <p>&nbsp;</p>
                        </td>
                      </tr>
                      <!-- Footer -->
                      <tr>
                        <td style="padding-top:0;padding-bottom:0;padding-right:30px;padding-left:30px;text-align:center;Margin-right:auto;Margin-left:auto;">
                          <center>
                            <p style="font-family:'Muli',Arial,sans-serif;Margin:0;text-align:center;Margin-right:auto;Margin-left:auto;font-size:15px;color:#a1a8ad;line-height:23px;">Problems or questions? Call us at
                              <nobr><a class="tel" href="tel:2128102899" style="color:#a1a8ad;text-decoration:none;" target="_blank"><span style="white-space: nowrap">+65 8877 5508</span></a></nobr>
                            </p>
            
                            <p style="font-family:'Muli',Arial,sans-serif;Margin:0;text-align:center;Margin-right:auto;Margin-left:auto;font-size:15px;color:#a1a8ad;line-height:23px;">or email <a href="mailto:tixme.team@gmail.com" style="color:#a1a8ad;text-decoration:underline;" target="_blank">tixme.team@gmail.com</a></p>
            
                            <p style="font-family:'Muli',Arial,sans-serif;Margin:0;text-align:center;Margin-right:auto;Margin-left:auto;padding-top:10px;padding-bottom:0px;font-size:15px;color:#a1a8ad;line-height:23px;">10 Jalan Besar <span style="white-space: nowrap">#17-02</span>, <span style="white-space: nowrap">Sim Lim Tower,</span> <span style="white-space: nowrap">Singapore 208787</span></p>
                          </center>
                        </td>
                      </tr>
                      <!-- whitespace -->
                      <tr>
                        <td height="40">
                          <p style="line-height: 40px; padding: 0 0 0 0; margin: 0 0 0 0;">&nbsp;</p>
            
                          <p>&nbsp;</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </center>
              <!--[if gte mso 9]>
            </td></tr></table>
            </center>
            <![endif]-->
            
            
            </body>
              
              
            </body>
            </html>
            `;

            await sendMail({
                email: check.email,
                subject: "Password Reset Request",
                message: htmlMessage,
                isHtml: true, // Set this to true to indicate that the message is in HTML format
            });
            const update = await Customer.updateOne({ email }, { otp });
            if (update.modifiedCount === 1) {
                res.status(201).json({
                    success: true,
                    message: "Your Gmail OTP has been sent"
                });
            } else {
                return next(new ErrorHandler("Internal Server Error", 400));
            }
        } else {
            return next(new ErrorHandler("No user found with the provided email", 400));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/customer/reset-password-check", async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const check = await Customer.findOne({ email, otp });
        if (check) {
            res.status(201).json({
                success: true,
                message: "Your OTP has been successfully verified."
            });
        } else {
            return next(new ErrorHandler("Incorrect OTP. Please double-check and try again", 400));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/customer/update-password", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const updateData = {};
        updateData.password = await bcrypt.hash(password, 10);
        const result = await Customer.updateOne({ email }, updateData);
        if (result.modifiedCount === 1) {
            const getdata = await Customer.findOne({ email });
            sendToken(getdata, 200, res);
        } else {
            return next(new ErrorHandler("Internal Server Error", 400));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

router.get("/organizer/reset-password", async (req, res, next) => {
    const result = await Admin.findOne({ email });
    res.status(201).json({
        success: true,
        message: result
    });
    
//     try {
//         const { email } = req.body;
//         const Imgurl = 'https://tixme.co/tixme_storage/storage/app/public/';
//         const check = await Organizer.findOne({ email, isactive: 1, isdelete: 0 });
//         if (check) {
//             const otp = Math.floor(100000 + Math.random() * 900000);
//             const htmlMessage = `<!DOCTYPE html>
//             <html >
//             <head>
//               <meta charset="UTF-8">
//               <title> Forgot password?</title>
              
              
              
              
              
//             </head>
            
//             <body>
//               <head>
//               <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
//               <!--[if !mso]><!-->
//               <meta http-equiv="X-UA-Compatible" content="IE=edge">
//               <!--<![endif]-->
//               <meta name="viewport" content="width=device-width, initial-scale=1.0">
//               <title></title>
//               <!--[if !mso]><!-->
//               <style type="text/css">
//                 @font-face {
//                           font-family: 'flama-condensed';
//                           font-weight: 100;
//                           src: url('http://assets.vervewine.com/fonts/FlamaCond-Medium.eot');
//                           src: url('http://assets.vervewine.com/fonts/FlamaCond-Medium.eot?#iefix') format('embedded-opentype'),
//                                 url('http://assets.vervewine.com/fonts/FlamaCond-Medium.woff') format('woff'),
//                                 url('http://assets.vervewine.com/fonts/FlamaCond-Medium.ttf') format('truetype');
//                       }
//                       @font-face {
//                           font-family: 'Muli';
//                           font-weight: 100;
//                           src: url('http://assets.vervewine.com/fonts/muli-regular.eot');
//                           src: url('http://assets.vervewine.com/fonts/muli-regular.eot?#iefix') format('embedded-opentype'),
//                                 url('http://assets.vervewine.com/fonts/muli-regular.woff2') format('woff2'),
//                                 url('http://assets.vervewine.com/fonts/muli-regular.woff') format('woff'),
//                                 url('http://assets.vervewine.com/fonts/muli-regular.ttf') format('truetype');
//                         }
//                       .address-description a {color: #000000 ; text-decoration: none;}
//                       @media (max-device-width: 480px) {
//                         .vervelogoplaceholder {
//                           height:83px ;
//                         }
//                       }
//               </style>
//               <!--<![endif]-->
//               <!--[if (gte mso 9)|(IE)]>
//                 <style type="text/css">
//                     .address-description a {color: #000000 ; text-decoration: none;}
//                     table {border-collapse: collapse ;}
//                 </style>
//                 <![endif]-->
//             </head>
            
//             <body bgcolor="#e1e5e8" style="margin-top:0 ;margin-bottom:0 ;margin-right:0 ;margin-left:0 ;padding-top:0px;padding-bottom:0px;padding-right:0px;padding-left:0px;background-color:#e1e5e8;">
//               <!--[if gte mso 9]>
//             <center>
//             <table width="600" cellpadding="0" cellspacing="0"><tr><td valign="top">
//             <![endif]-->
//               <center style="width:100%;table-layout:fixed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#e1e5e8;">
//                 <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;">
//                   <table align="center" cellpadding="0" style="border-spacing:0;font-family:'Muli',Arial,sans-serif;color:#333333;Margin:0 auto;width:100%;max-width:600px;">
//                     <tbody>
//                       <tr>
//                         <td align="center" class="vervelogoplaceholder" height="143" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;height:143px;vertical-align:middle;" valign="middle"><span class="sg-image" data-imagelibrary="%7B%22width%22%3A%22160%22%2C%22height%22%3A34%2C%22alt_text%22%3A%22Verve%20Wine%22%2C%22alignment%22%3A%22%22%2C%22border%22%3A0%2C%22src%22%3A%22https%3A//marketing-image-production.s3.amazonaws.com/uploads/79d8f4f889362f0c7effb2c26e08814bb12f5eb31c053021ada3463c7b35de6fb261440fc89fa804edbd11242076a81c8f0a9daa443273da5cb09c1a4739499f.png%22%2C%22link%22%3A%22%23%22%2C%22classes%22%3A%7B%22sg-image%22%3A1%7D%7D"><a href="#" target="_blank"><img alt="Verve Wine" height="34" src="${'https://tixme.co/tixme_storage/storage/app/public/applogo/tixmeoriginlogo.png'}" style="border-width: 0px; width: 160px; height: auto;" width="160"></a></span></td>
//                       </tr>
//                       <!-- Start of Email Body-->
//                       <tr>
//                         <td class="one-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;background-color:#ffffff;">
//                           <!--[if gte mso 9]>
//                                 <center>
//                                 <table width="80%" cellpadding="20" cellspacing="30"><tr><td valign="top">
//                                 <![endif]-->
//                           <table style="border-spacing:0;" width="100%">
//                             <tbody>
//                               <tr>
//                                 <td align="center" class="inner" style="padding-top:15px;padding-bottom:15px;padding-right:30px;padding-left:30px;" valign="middle"><span class="sg-image" data-imagelibrary="%7B%22width%22%3A%22255%22%2C%22height%22%3A93%2C%22alt_text%22%3A%22Forgot%20Password%22%2C%22alignment%22%3A%22%22%2C%22border%22%3A0%2C%22src%22%3A%22https%3A//marketing-image-production.s3.amazonaws.com/uploads/35c763626fdef42b2197c1ef7f6a199115df7ff779f7c2d839bd5c6a8c2a6375e92a28a01737e4d72f42defcac337682878bf6b71a5403d2ff9dd39d431201db.png%22%2C%22classes%22%3A%7B%22sg-image%22%3A1%7D%7D"><img alt="Forgot Password" class="banner" height="93" src="${'https://tixme.co/tixme_storage/storage/app/public/applogo/3293465.jpg'}" style="border-width: 0px; margin-top: 30px; width: 255px; height: auto;" width="255"></span></td>
//                               </tr>
//                               <tr>
//                                 <td class="inner contents center" style="padding-top:15px;padding-bottom:15px;padding-right:30px;padding-left:30px;text-align:left;">
//                                   <center>
//                                     <p class="h1 center" style="Margin:0;text-align:center;font-family:'flama-condensed','Arial Narrow',Arial;font-weight:100;font-size:30px;Margin-bottom:26px;">Forgot your password?</p>
//                                     <!--[if (gte mso 9)|(IE)]><![endif]-->
            
//                                     <p class="description center" style="font-family:'Muli','Arial Narrow',Arial;Margin:0;text-align:center;max-width:320px;color:#a1a8ad;line-height:24px;font-size:15px;Margin-bottom:10px;margin-left: auto; margin-right: auto;"><span style="color: rgb(161, 168, 173); font-family: Muli, &quot;Arial Narrow&quot;, Arial; font-size: 15px; text-align: center; background-color: rgb(255, 255, 255);">That's okay, it happens! Please note that this code is valid for one-time use only. Do not share this code with anyone for security reasons.</span></p>
//                                     <div style="text-align: center;">
//     <span style="background-color: black; color: white; font-size: 24px; letter-spacing: 5px; padding: 5px 20px;">${otp}</span>
// </div>

//                                     <!--[if (gte mso 9)|(IE)]><br>&nbsp;<![endif]--></center>
//                                 </td>
//                               </tr>
//                             </tbody>
//                           </table>
//                           <!--[if (gte mso 9)|(IE)]>
//                                 </td></tr></table>
//                                 </center>
//                                 <![endif]-->
//                         </td>
//                       </tr>
//                       <!-- End of Email Body-->
//                       <!-- whitespace -->
//                       <tr>
//                         <td height="40">
//                           <p style="line-height: 40px; padding: 0 0 0 0; margin: 0 0 0 0;">&nbsp;</p>
            
//                           <p>&nbsp;</p>
//                         </td>
//                       </tr>
//                       <!-- Social Media -->
//                       <tr>
//                         <td align="center" style="padding-bottom:0;padding-right:0;padding-left:0;padding-top:0px;" valign="middle"><span class="sg-image" data-imagelibrary="%7B%22width%22%3A%228%22%2C%22height%22%3A18%2C%22alt_text%22%3A%22Facebook%22%2C%22alignment%22%3A%22%22%2C%22border%22%3A0%2C%22src%22%3A%22https%3A//marketing-image-production.s3.amazonaws.com/uploads/0a1d076f825eb13bd17a878618a1f749835853a3a3cce49111ac7f18255f10173ecf06d2b5bd711d6207fbade2a3779328e63e26a3bfea5fe07bf7355823567d.png%22%2C%22link%22%3A%22%23%22%2C%22classes%22%3A%7B%22sg-image%22%3A1%7D%7D"><a href="https://www.facebook.com/profile.php?id=61556603844279" target="_blank"><img alt="Facebook" height="18" src="${Imgurl + 'social/facebook.png'}" style="border-width: 0px; margin-right: 21px; margin-left: 21px; width: 20px; height: auto;" width="8"></a></span>
//                           <!--[if gte mso 9]>&nbsp;&nbsp;&nbsp;<![endif]--><span class="sg-image" data-imagelibrary="%7B%22width%22%3A%2223%22%2C%22height%22%3A18%2C%22alt_text%22%3A%22Twitter%22%2C%22alignment%22%3A%22%22%2C%22border%22%3A0%2C%22src%22%3A%22https%3A//marketing-image-production.s3.amazonaws.com/uploads/6234335b200b187dda8644356bbf58d946eefadae92852cca49fea227cf169f44902dbf1698326466ef192bf122aa943d61bc5b092d06e6a940add1368d7fb71.png%22%2C%22link%22%3A%22%23%22%2C%22classes%22%3A%7B%22sg-image%22%3A1%7D%7D"><a href="https://www.instagram.com/tixme.co" target="_blank"><img alt="Twitter" height="18" src="${Imgurl + 'social/instagram.png'}" style="border-width: 0px; margin-right: 16px; margin-left: 16px; width: 20px; height: auto;" width="23"></a></span>
//                           <!--[if gte mso 9]>&nbsp;&nbsp;&nbsp;&nbsp;<![endif]--><span class="sg-image" data-imagelibrary="%7B%22width%22%3A%2218%22%2C%22height%22%3A18%2C%22alt_text%22%3A%22Instagram%22%2C%22alignment%22%3A%22%22%2C%22border%22%3A0%2C%22src%22%3A%22https%3A//marketing-image-production.s3.amazonaws.com/uploads/650ae3aa9987d91a188878413209c1d8d9b15d7d78854f0c65af44cab64e6c847fd576f673ebef2b04e5a321dc4fed51160661f72724f1b8df8d20baff80c46a.png%22%2C%22link%22%3A%22%23%22%2C%22classes%22%3A%7B%22sg-image%22%3A1%7D%7D"><a href="https://www.linkedin.com/company/tixme-co" target="_blank"><img alt="Instagram" height="18" src="${Imgurl + 'social/linkedin.png'}" style="border-width: 0px; margin-right: 16px; margin-left: 16px; width: 20px; height: auto;" width="18"></a></span></td>
//                       </tr>
//                       <!-- whitespace -->
//                       <tr>
//                         <td height="25">
//                           <p style="line-height: 25px; padding: 0 0 0 0; margin: 0 0 0 0;">&nbsp;</p>
            
//                           <p>&nbsp;</p>
//                         </td>
//                       </tr>
//                       <!-- Footer -->
//                       <tr>
//                         <td style="padding-top:0;padding-bottom:0;padding-right:30px;padding-left:30px;text-align:center;Margin-right:auto;Margin-left:auto;">
//                           <center>
//                             <p style="font-family:'Muli',Arial,sans-serif;Margin:0;text-align:center;Margin-right:auto;Margin-left:auto;font-size:15px;color:#a1a8ad;line-height:23px;">Problems or questions? Call us at
//                               <nobr><a class="tel" href="tel:2128102899" style="color:#a1a8ad;text-decoration:none;" target="_blank"><span style="white-space: nowrap">+65 8877 5508</span></a></nobr>
//                             </p>
            
//                             <p style="font-family:'Muli',Arial,sans-serif;Margin:0;text-align:center;Margin-right:auto;Margin-left:auto;font-size:15px;color:#a1a8ad;line-height:23px;">or email <a href="mailto:tixme.team@gmail.com" style="color:#a1a8ad;text-decoration:underline;" target="_blank">tixme.team@gmail.com</a></p>
            
//                             <p style="font-family:'Muli',Arial,sans-serif;Margin:0;text-align:center;Margin-right:auto;Margin-left:auto;padding-top:10px;padding-bottom:0px;font-size:15px;color:#a1a8ad;line-height:23px;">10 Jalan Besar <span style="white-space: nowrap">#17-02</span>, <span style="white-space: nowrap">Sim Lim Tower,</span> <span style="white-space: nowrap">Singapore 208787</span></p>
//                           </center>
//                         </td>
//                       </tr>
//                       <!-- whitespace -->
//                       <tr>
//                         <td height="40">
//                           <p style="line-height: 40px; padding: 0 0 0 0; margin: 0 0 0 0;">&nbsp;</p>
            
//                           <p>&nbsp;</p>
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>
//               </center>
//               <!--[if gte mso 9]>
//             </td></tr></table>
//             </center>
//             <![endif]-->
            
            
//             </body>
              
              
//             </body>
//             </html>
//             `;

//             await sendMail({
//                 email: check.email,
//                 subject: "Password Reset Request",
//                 message: htmlMessage,
//                 isHtml: true, // Set this to true to indicate that the message is in HTML format
//             });
//             const update = await Organizer.updateOne({ _id: check._id }, { otp });
//             if (update.modifiedCount === 1) {
//                 res.status(201).json({
//                     success: true,
//                     message: "Your Gmail OTP has been sent"
//                 });
//             } else {
//                 return next(new ErrorHandler("Internal Server Error", 400));
//             }
//         } else {
//             return next(new ErrorHandler("No user found with the provided email", 400));
//         }
//     } catch (error) {
//         return next(new ErrorHandler(error.message, 400));
//     }
});
router.post("/organizer/reset-password-check", async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const check = await Organizer.findOne({ email, otp, isactive: 1 });
        if (check) {
            res.status(201).json({
                success: true,
                message: "Your OTP has been successfully verified."
            });
        } else {
            return next(new ErrorHandler("Incorrect OTP. Please double-check and try again", 400));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/organizer/update-password", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const updateData = {};
        updateData.password = await bcrypt.hash(password, 10);
        const result = await Organizer.updateOne({ email }, updateData);
        if (result.modifiedCount === 1) {
            const getdata = await Organizer.findOne({ email });
            res.status(201).json({
                success: true,
                data: getdata
            });
        } else {
            return next(new ErrorHandler("Internal Server Error", 400));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/customer/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new ErrorHandler("Please provide the all fields!", 400));
        }
        const result = await Customer.findOne({ email, login_type: "Email", isdelete: 0 }).select("+password");
        if (result) {
            const isPasswordvalid = await result.comparePassword(password);
            if (!isPasswordvalid) {
                return next(new ErrorHandler("Invalid password", 400));
            }
            sendToken(result, 200, res);
        } else {
            return next(new ErrorHandler("User not found", 400));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
// organizer
router.post("/organizer/signup", async (req, res, next) => {
    try {
        const { first_name, last_name, email, phone_number, area_code, message, agree_to_terms, countryname } = req.body;
        const isactive = 0;
        const name = first_name + ' ' + last_name;
        if (!first_name) {
            return next(new ErrorHandler("First name is require", 400));
        }
        if (!last_name) {
            return next(new ErrorHandler("Last name is require", 400));
        }
        if (!email) {
            return next(new ErrorHandler("Email is require", 400));
        }
        if (!phone_number) {
            return next(new ErrorHandler("Phone number is require", 400));
        }
        const checkEmail = await Organizer.findOne({ email, isdelete: 0 });
        if (checkEmail) {
            return next(new ErrorHandler("This email is already registered with an account. Please try with another email address", 400));
        }
        const result = await Organizer.create({
            name,
            first_name,
            last_name,
            email,
            phone_number,
            countryname,
            area_code,
            issignupcomplete: 0,
            message,
            agree_to_terms,
            isactive,
            date: Mindate,
            isdelete: 0
        });
        const currentdate = moment().format('DD-MM-YYYY');
        const emailTemplate = `${mailHeader()}
                <div class="email-container">
                <div class="email-body">
                <div style="text-align: left">
                    <p>Dear Admin,</p>
                    <p>An organizer has signed up on Tixme and requires your approval to start hosting events. Below are the details of the organizer:</p>
                    <div>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Phone Number:</strong> ${phone_number}</p>
                        <p><strong>Country:</strong> ${countryname}</p>
                        <p><strong>Message:</strong> ${message}</p>
                        <p><strong>Registered on:</strong> ${currentdate}</p>
                    </div>
                    <p>Please review their profile and decide whether to approve or deny their registration.</p>
                    <p>Thank you for overseeing these important decisions and ensuring the quality of our platform.</p>
                    <p>Best Regards,<br>
                    The Tixme Team</p>
                </div>  
                </div>
                ${mailFooter()}
              `;
        await sendMail({
            email: AdminEmail(),
            subject: 'Organizer approval request',
            message: emailTemplate,
            isHtml: true,
        });

        res.status(201).json({
            success: true,
            userid: result
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/organizer_create", async (req, res, next) => {
    try {
        const { first_name, last_name, email, phone_number, area_code, message, agree_to_terms, countryname,
            bank_country_value, bank_country_label, bankaccount, bankname, holdername, swiftcode, password
        } = req.body;
        const isactive = 0;
        const name = first_name + ' ' + last_name;
        if (!first_name) {
            return next(new ErrorHandler("First name is require", 400));
        }
        if (!last_name) {
            return next(new ErrorHandler("Last name is require", 400));
        }
        if (!email) {
            return next(new ErrorHandler("Email is require", 400));
        }
        if (!phone_number) {
            return next(new ErrorHandler("Phone number is require", 400));
        }
        const checkEmail = await Organizer.findOne({ email });
        if (checkEmail) {
            return next(new ErrorHandler("Email already exist", 400));
        }
        const updateData = {};
        updateData.name = name;
        updateData.first_name = first_name;
        updateData.last_name = last_name;
        updateData.email = email;
        updateData.phone_number = phone_number;
        updateData.countryname = countryname;
        updateData.area_code = area_code;
        updateData.issignupcomplete = 0;
        updateData.message = message;
        updateData.agree_to_terms = agree_to_terms;
        updateData.isactive = isactive;
        updateData.date = Mindate;
        updateData.isdelete = 0;
        updateData.bankaccount = bankaccount;
        updateData.bankname = bankname;
        updateData.holdername = holdername;
        updateData.swiftcode = swiftcode;
        updateData.bank_country_value = bank_country_value;
        updateData.bank_country_label = bank_country_label;
        updateData.isactive = 1;
        updateData.password = await bcrypt.hash(password, 10);
        const result = await Organizer.create({
            updateData
        });
        res.status(201).json({
            success: true,
            message: "Successs"
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/organizer/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new ErrorHandler("Please provide the all fields!", 400));
        }
        const result = await Organizer.findOne({ email, isdelete: 0 }).select("+password");
        if (!result) {
            return next(new ErrorHandler("User not found", 400));
        }
        if (result.isactive == 0) {
            res.status(400).json({
                success: false,
                data: "Organizer verification pending"
            });
        }
        if (result && result.isactive == 1) {
            const isPasswordvalid = await result.comparePassword(password);
            if (!isPasswordvalid) {
                return next(new ErrorHandler("Invalid password", 400));
            }
            const user_data = await Organizer.findOne({ email });
            // sendToken(result, 200, res);
            res.status(201).json({
                success: true,
                data: user_data
            });
        } else {
            return next(new ErrorHandler("User not found", 400));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/organizer/details", async (req, res, next) => {
    try {
        const { id } = req.body;
        const result = await Organizer.findOne({ _id: id });
        res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
// admin
router.post("/admin/login", async (req, res, next) => {       
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');  
   
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return next(new ErrorHandler("Please provide the all fields!", 400));
        }
        const result = await Admin.findOne({ username }).select("+password");
        if (result) {
            const isPasswordvalid = await result.comparePassword(password);
            if (!isPasswordvalid) {
                return next(new ErrorHandler("Invalid password", 400));
            }
            res.status(200).json({
                success: true,
                data: result
            });
        } else {
            return next(new ErrorHandler("User not found", 400));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/admin/signup", async (req, res, next) => {
    try {
        const { name, email, username, password, role } = req.body;
        const checkEmail = await Admin.findOne({ email });
        const checkUsername = await Admin.findOne({ username });
        if (checkEmail) {
            return next(new ErrorHandler("Email already exist", 400));
        }
        if (checkUsername) {
            return next(new ErrorHandler("Username already exist", 400));
        }
        const result = await Admin.create({
            name,
            email,
            username,
            password,
            role
        });
        res.status(201).json({
            success: true,
            data: result
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/organizer-account-active", async (req, res, next) => {
    try {
        const { bank_country_value, bank_country_label, id, bankaccount, bankname, holdername, swiftcode, password } = req.body;
        const updateData = {};
        updateData.bankaccount = bankaccount;
        updateData.bankname = bankname;
        updateData.holdername = holdername;
        updateData.swiftcode = swiftcode;
        updateData.bank_country_value = bank_country_value;
        updateData.bank_country_label = bank_country_label;
        updateData.isactive = 1;
        updateData.password = await bcrypt.hash(password, 10);
        const Update = await Organizer.updateOne({ _id: id }, updateData);
        if (Update.modifiedCount === 1) {
            const user_data = await Organizer.findOne({ _id: id });
            res.status(201).json({
                success: true,
                data: user_data
            });
        } else {
            return next(new ErrorHandler("Something went wrong !", 400));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/deleteaccount", async (req, res, next) => {
    try {
        const { id, type } = req.body;
        if (type == "Organizer") {
            $check = await Organizer.find({ _id: id, isdelete: 0 });
            if ($check) {
                await Organizer.updateOne({ _id: id }, { isdelete: 1 });
                await Event.updateMany({ organizer_id: id }, { isdelete: 1 });
                res.status(200).json({
                    success: true,
                    data: "Deleted"
                });
            }
        }
        if (type == "Customer") {
            $check = await Customer.find({ _id: id, isdelete: 0 });
            if ($check) {
                await Customer.updateOne({ _id: id }, { isdelete: 1 });
                res.status(200).json({
                    success: true,
                    data: "Deleted"
                });
            }
        }
        return next(new ErrorHandler("No user found", 400));
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
module.exports = router;