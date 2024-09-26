const express = require("express");
const moment = require('moment');
const Partnerimg = require("../model/partnerimg");
const Admin = require("../model/admin");
const Organizer = require("../model/organizer");
const Eventtax = require("../model/eventtax");
const Customer = require("../model/customer");
const Order = require("../model/order");
const Packageplan = require("../model/packageplan");
const sendMail = require("../utils/sendMail");
const Eventpayout = require("../model/eventpayout");
const Payoutlog = require("../model/payoutlog");
const Event = require("../model/event");
const Tax = require("../model/tax");
const Coupon = require("../model/coupon");
const Orderitem = require("../model/orderitem");
const Subscribe = require("../model/subscribe");
const Hobby = require("../model/hobby");
const Country = require("../model/country");
const router = express.Router();
const Contact = require("../model/contact");
const Support = require("../model/support");
const bcrypt = require("bcryptjs");
const ErrorHandler = require("../utils/ErrorHandler");
const { Mindate, DateValue, OnlyYear, TimeValue, TomorrowMinDate, getYearFromDate, getMonthFromDate, getSevenDaysAfter, getNextMonth, getNextMonthAndYear, generateUniqueIdentifier } = require("../utils/Helper");

// organizer
router.post("/active-organizer", async (req, res, next) => {
    try {
        const { id } = req.body;
        const Imgurl = 'https://tixme.co/tixme_storage/storage/app/public/';
        const orgData = await Organizer.findOne({ _id: id });
        const ActiveUrl = process.env.MAIN_URL + 'registration/' + orgData._id;
        const Logo = process.env.ASSET_URL + 'applogo/originallogo.svg';
        // ${ActiveUrl}
        // ${orgData.name}
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
                <tr style="visibility: hidden;">
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
                            <td align="center" class="inner" style="padding-top:15px;padding-bottom:15px;padding-right:30px;padding-left:30px;" valign="middle"><span class="sg-image" data-imagelibrary="%7B%22width%22%3A%22255%22%2C%22height%22%3A93%2C%22alt_text%22%3A%22Forgot%20Password%22%2C%22alignment%22%3A%22%22%2C%22border%22%3A0%2C%22src%22%3A%22https%3A//marketing-image-production.s3.amazonaws.com/uploads/35c763626fdef42b2197c1ef7f6a199115df7ff779f7c2d839bd5c6a8c2a6375e92a28a01737e4d72f42defcac337682878bf6b71a5403d2ff9dd39d431201db.png%22%2C%22classes%22%3A%7B%22sg-image%22%3A1%7D%7D"><img alt="Forgot Password" class="banner" height="93" src="${'https://tixme.co/tixme_storage/storage/app/public/applogo/tixmeoriginlogo.png'}" style="border-width: 0px; margin-top: 30px; width: 255px; height: 93px;" width="255"></span></td>
                          </tr>
                          <tr>
                            <td class="inner contents center" style="padding-top:15px;padding-bottom:15px;padding-right:30px;padding-left:30px;text-align:left;">
                              <center>
                                <p class="h1 center" style="Margin:0;text-align:center;font-family:'flama-condensed','Arial Narrow',Arial;font-weight:100;font-size:30px;Margin-bottom:26px;">Activate Your Account</p>
                                <!--[if (gte mso 9)|(IE)]><![endif]-->
        
                                <p class="description center" style="font-family:'Muli','Arial Narrow',Arial;Margin:0;text-align:center;max-width:320px;color:#a1a8ad;line-height:24px;font-size:15px;Margin-bottom:10px;margin-left: auto; margin-right: auto;"><span style="color: rgb(161, 168, 173); font-family: Muli, &quot;Arial Narrow&quot;, Arial; font-size: 15px; text-align: center; background-color: rgb(255, 255, 255);">Dear ${orgData.name}, Thank you for registering with us. Please click the button below to activate your account.</span></p>
                                <span class="sg-image" data-imagelibrary="%7B%22width%22%3A%22260%22%2C%22height%22%3A54%2C%22alt_text%22%3A%22Reset%20your%20Password%22%2C%22alignment%22%3A%22%22%2C%22border%22%3A0%2C%22src%22%3A%22https%3A//marketing-image-production.s3.amazonaws.com/uploads/c1e9ad698cfb27be42ce2421c7d56cb405ef63eaa78c1db77cd79e02742dd1f35a277fc3e0dcad676976e72f02942b7c1709d933a77eacb048c92be49b0ec6f3.png%22%2C%22link%22%3A%22%23%22%2C%22classes%22%3A%7B%22sg-image%22%3A1%7D%7D"><a href="${ActiveUrl}" target="_blank"><img alt="Reset your Password" height="54" src="https://marketing-image-production.s3.amazonaws.com/uploads/c1e9ad698cfb27be42ce2421c7d56cb405ef63eaa78c1db77cd79e02742dd1f35a277fc3e0dcad676976e72f02942b7c1709d933a77eacb048c92be49b0ec6f3.png" style="border-width: 0px; margin-top: 30px; margin-bottom: 50px; width: 260px; height: 54px;" width="260"></a></span>

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
            email: orgData.email,
            subject: "Account Activation",
            message: htmlMessage,
            isHtml: true, // Set this to true to indicate that the message is in HTML format
        });

        const updateData = {};
        updateData.issignupcomplete = 1;
        const result = await Organizer.updateOne({ _id: id }, updateData);
        if (result.modifiedCount === 1) {
            const updateData = await Organizer.findOne({ _id: id });
            res.status(200).json({
                success: true,
                data: updateData
            });
        } else {
            res.status(404).json({
                success: false,
                data: 'Data not found'
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/deactive-organizer", async (req, res, next) => {
    try {
        const { id, isactive } = req.body;
        const updateData = {};
        updateData.isactive = isactive;
        const result = await Organizer.updateOne({ _id: id }, updateData);
        if (result.modifiedCount === 1) {
            const updateData = await Organizer.findOne({ _id: id });
            res.status(200).json({
                success: true,
                data: updateData
            });
        } else {
            res.status(404).json({
                success: false,
                data: 'Data not found'
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/get-organizer-list", async (req, res, next) => {
    try {
        const { isactive } = req.body;
        const result = await Organizer.find({ isactive, isdelete: 0 }).sort({ _id: -1 }).exec();
        if (result) {
            res.status(200).json({
                success: true,
                data: result
            });
        } else {
            res.status(404).json({
                success: false,
                data: 'Organizer not found'
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/get-delete-organizer-list", async (req, res, next) => {
    try {
        const result = await Organizer.find({isdelete: 1 }).sort({ _id: -1 }).exec();
        if (result) {
            res.status(200).json({
                success: true,
                data: result
            });
        } else {
            res.status(404).json({
                success: false,
                data: 'Organizer not found'
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/get-organizer-details", async (req, res, next) => {
    try {
        const { id } = req.body;
        const result = await Organizer.findOne({ _id: id });
        if (result) {
            res.status(200).json({
                success: true,
                data: result
            });
        } else {
            res.status(404).json({
                success: false,
                data: 'Organizer not found'
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
// event
router.post("/event-list", async (req, res, next) => {
    try {
        let matchCondition = {};
        matchCondition.isdelete = 0;
        
        const eventList = await Event.aggregate([
            {
                $addFields: {
                    convertedOrderId: { $toString: "$_id" }
                }
            },
            {
                $match: matchCondition
            },
            {
                $lookup: {
                    from: 'ordersevents',
                    localField: 'convertedOrderId',
                    foreignField: 'event_id',
                    as: 'eventData',
                }
            },
            {
                $sort: {
                    createdAt: -1 // Sort by createdAt in descending order
                }
            }
        ]);
        res.status(200).json({
            success: true,
            data: eventList,
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
// package-plan
router.post("/create-package-plan", async (req, res, next) => {
    try {
        const { name, purchase_amount, discount_amount } = req.body;
        const InsertData = await Packageplan.create({ name, purchase_amount, discount_amount, isdelete: 0 });
        if (InsertData) {
            res.status(200).json({
                success: true,
                data: InsertData
            });
        } else {
            return next(new ErrorHandler("Insert failed", 400));
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/update-package-plan", async (req, res, next) => {
    try {
        const { name, purchase_amount, discount_amount, id } = req.body;
        const updateData = await Packageplan.updateOne({ _id: id }, { name, purchase_amount, discount_amount });
        if (updateData.modifiedCount == 1) {
            res.status(200).json({
                success: true,
                message: "Updated successfully"
            });
        } else {
            return next(new ErrorHandler("Update failed", 400));
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/delete-package-plan", async (req, res, next) => {
    try {
        const { id } = req.body;
        const updateData = await Packageplan.updateOne({ _id: id }, { isdelete: 1 });
        if (updateData.modifiedCount == 1) {
            res.status(200).json({
                success: true,
                message: "Deleted successfully"
            });
        } else {
            return next(new ErrorHandler("Update failed", 400));
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/package-plan-details", async (req, res, next) => {
    try {
        const { id } = req.body;
        const Data = await Packageplan.findOne({ _id: id });
        res.status(200).json({
            success: true,
            data: Data
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/newsletterlist", async (req, res, next) => {
    try {
        const list = await Subscribe.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: list
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/package-plan-list", async (req, res, next) => {
    try {
        // Using aggregation to get the count of users for each package plan
        const planWithUserCount = await Packageplan.aggregate([
            {
                $match: { isdelete: 0 }
            },
            {
                $addFields: {
                    convertedMemerid: { $toString: "$_id" }
                }
            },
            {
                $lookup: {
                    from: 'customers', // Assuming your user collection is named 'customers'
                    let: { planId: "$convertedMemerid" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$planid", "$$planId"] },
                                        { $eq: ["$isdelete", 0] },
                                        { $ne: ["$login_type", "Guest"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'users'
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    purchase_amount: 1,
                    discount_amount: 1,
                    userCount: { $size: "$users" }
                }
            }
        ]);
        
        res.status(200).json({
            success: true,
            data: planWithUserCount
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// customer
router.post("/get-customer-details", async (req, res, next) => {
    try {
        const { id } = req.body;
        const result = await Customer.findOne({ _id: id });
        if (result) {
            res.status(200).json({
                success: true,
                data: result
            });
        } else {
            res.status(404).json({
                success: false,
                data: 'Customer not found'
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/get-customer-list-with-filter", async (req, res, next) => {
    try {
        const { membershipid } = req.body;
        const result = await Customer.find({ planid: membershipid, isdelete: 0 }).sort({ _id: -1 }).exec();
        if (result) {
            res.status(200).json({
                success: true,
                data: result
            });
        } else {
            res.status(404).json({
                success: false,
                data: 'Customer not found'
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/get-customer-list", async (req, res, next) => {
    try {
        const { membershipid } = req.body;
        let result = [];
        if (membershipid) {
            result = await Customer.find({
                $or: [{ login_type: { $ne: "Guest" }, isdelete: 0 }]
            }).sort({ createdAt: -1 }).exec();
        } else {
            result = await Customer.find({
                $or: [{ planid: null, isdelete: 0 }, { login_type: "Guest" }]
            }).sort({ createdAt: -1 }).exec();
        }
        if (result) {
            res.status(200).json({
                success: true,
                data: result
            });
        } else {
            res.status(404).json({
                success: false,
                data: 'Customer not found'
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/get-users", async (req, res, next) => {
    try {
        const { country } = req.body;
        const result = await Customer.find({ country: country, isdelete: 0 });
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/support/view", async (req, res, next) => {
    try {
        const {
            id
        } = req.body;
        const list = await Support.findOne({ _id: id });
        res.status(200).json({
            success: true,
            data: list
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/support/store-replay", async (req, res, next) => {
    try {
        const {
            replymessage,
            id,
            closestatus
        } = req.body;
        const closeupdate = await Support.updateOne({ _id: id }, { isclose: closestatus });
        const date = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');
        const usertype = "Admin";
        if (replymessage) {
            const newItem = {
                replymessage,
                date,
                time: TimeValue,
                usertype
            };
            const updateQuery = {
                $push: {
                    messagelog: newItem
                }
            };
            const result = await Support.updateOne({ _id: id }, updateQuery);
            if (result.modifiedCount === 1) {
                res.status(201).json({
                    success: true,
                    data: 'Reply successful'
                });
            } else {
                res.status(404).json({
                    success: false,
                    data: 'Update failed'
                });
            }
        } else {
            if (closeupdate.modifiedCount === 1) {
                res.status(201).json({
                    success: true,
                    data: 'Successful'
                });
            } else {
                res.status(404).json({
                    success: false,
                    data: 'unsuccessful'
                });
            }
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/support/list", async (req, res, next) => {
    try {
        // const {
        //     isclose,
        // } = req.body;
        const isdelete = 0;
        const list = await Support.find({ isdelete }).sort({ _id: -1 }).exec();
        res.status(200).json({
            success: true,
            data: list
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
// contact us
router.post("/contact-us/list", async (req, res, next) => {
    try {
        const isdelete = 0;
        const list = await Contact.find({ isdelete }).sort({ _id: -1 }).exec();
        res.status(200).json({
            success: true,
            data: list
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/hobby/insert", async (req, res, next) => {
    try {
        const { name } = req.body;
        const insert = await Hobby.create({ name, isdelete: 0 });
        if (insert) {
            res.status(200).json({
                success: true,
                data: insert
            });
        } else {
            return next(new ErrorHandler("Insert failed", 400));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

router.post("/get-organizer-details", async (req, res, next) => {
    try {
        const { id } = req.body;
        const userid = id;
        const data = await Organizer.findOne({ _id: userid });
        if (!data) {
            return next(new ErrorHandler("No data found", 400));
        } else {
            res.status(200).json({
                success: true,
                data: data
            });
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/get-user-details", async (req, res, next) => {
    try {
        const { id } = req.body;
        const userid = id;
        const data = await Customer.findOne({ _id: userid });
        if (!data) {
            return next(new ErrorHandler("No data found", 400));
        } else {
            res.status(200).json({
                success: true,
                data: data
            });
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/create-country", async (req, res, next) => {
    try {
        const { name, currency, symbol } = req.body;
        const check = await Country.findOne({ name });
        if (check) {
            return next(new ErrorHandler("Country already exist", 400));
        }
        const data = await Country.create({ name });
        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/country-list", async (req, res, next) => {
    try {
        const list = await Country.find();
        res.status(200).json({
            success: true,
            data: list
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/country-dash-data", async (req, res, next) => {
    try {
        const { country } = req.body;
        const currentDate = moment().format('YYYYMMDD');
        const ActiveEvent = await Event.countDocuments({ visibility: 1, admin_publish: 1, countryname: country, isdelete: 0 });
        const PendingEvent = await Event.countDocuments({ visibility: 1, admin_publish: 2, countryname: country, isdelete: 0 });
        const UpcomingEvents = await Event.countDocuments({
            visibility: 1,
            isdelete: 0,
            countryname: country,
            start_mindate: { $gt: currentDate }
        });
        const Activeuser = await Customer.countDocuments({ country: country, isdelete: 0 });
        const ActiveOrganizer = await Organizer.countDocuments({ isactive: 1, countryname: country, isdelete: 0 });
        const PendingOrganizer = await Organizer.countDocuments({ isactive: 0, countryname: country, isdelete: 0 });
        const responseData = {
            ActiveEvent,
            PendingEvent,
            UpcomingEvents,
            Activeuser,
            ActiveOrganizer,
            PendingOrganizer
        };
        res.status(200).json({
            success: true,
            data: responseData,
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/dashboard-analytics-data", async (req, res, next) => {
    try {
        const totalRevenueResult = await Order.aggregate([
            { $match: { payment_status: "1" } },
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
        ]);
        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].totalAmount : 0;
        const TotalEventHosted = await Event.countDocuments({ isdelete: 0 });
        const TotalPendinEvent = await Event.countDocuments({ visibility:1, admin_publish: 2,isdelete: 0 });
        const TotalTicketSold = await Orderitem.countDocuments({ isvalid: 0 });
        const TotalUser = await Customer.countDocuments({ isdelete: 0 });
        const TotalActiveOrg = await Organizer.countDocuments({ isdelete: 0, isactive: 1 });
        const TotalPendingOrg = await Organizer.countDocuments({ isdelete: 0, isactive: 0 });
        const responseData = {
            totalRevenue,
            TotalEventHosted,
            TotalPendinEvent,
            TotalTicketSold,
            TotalUser,
            TotalActiveOrg,
            TotalPendingOrg
        };
        res.status(200).json({
            success: true,
            data: responseData,
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/payout-request-list", async (req, res, next) => {
    try {
        const { country } = req.body;
        const list = await Payoutlog.find({ country }).sort({ _id: -1 }).exec();
        res.status(201).json({
            success: true,
            data: list
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});
router.post("/coupon-details", async (req, res, next) => {
    try {
        const { id } = req.body;
        const Data = await Coupon.findOne({ _id: id });
        res.status(200).json({
            success: true,
            data: Data
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/coupon-insert", async (req, res, next) => {
    try {
        const { upid, name, point, discount, currency } = req.body;
        if (upid) {
            await Coupon.updateOne({ _id: upid }, { name, point, discount, currency, isdelete: 0 });
        } else {
            await Coupon.create({ name, point, discount, currency, isdelete: 0 });
        }
        res.status(200).json({
            success: true,
            message: "successful"
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/tax-insert", async (req, res, next) => {
    try {
        const { name, taxamount } = req.body;
        await Tax.create({ name, taxamount, isdelete: 0 });
        res.status(200).json({
            success: true,
            message: "Tax created successfully"
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/tax-update", async (req, res, next) => {
    try {
        const { id, name, taxamount } = req.body;
        if (name) {
            await Tax.updateOne({ _id: id }, { name });
        }
        if (taxamount) {
            await Tax.updateOne({ _id: id }, { taxamount });
        }
        res.status(200).json({
            success: true,
            message: "Tax updated successfully"
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/tax-delete", async (req, res, next) => {
    try {
        const { id } = req.body;
        await Tax.updateOne({ _id: id }, { isdelete: 1 });
        res.status(200).json({
            success: true,
            message: "Tax deleted successfully"
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/tax-list", async (req, res, next) => {
    try {
        const List = await Tax.find().sort({ createdAt: -1 }).exec();
        res.status(200).json({
            success: true,
            data: List
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/coupon-delete", async (req, res, next) => {
    try {
        const { id } = req.body;
        const update = await Coupon.updateOne({ _id: id }, { isdelete: 1 });
        if (update.modifiedCount === 1) {
            res.status(200).json({
                success: true,
                message: "Deleted"
            });
        } else {
            return next(new ErrorHandler("Failed", 400));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/get-coupon-list", async (req, res, next) => {
    try {
        const list = await Coupon.find({ isdelete: 0 }).sort({ createdAt: -1 }).exec();
        res.status(200).json({
            success: true,
            data: list
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/get-payout-request-list", async (req, res, next) => {
    try {
        const { country } = req.body;
        const List = await Eventpayout.aggregate([
            {
                $match: {
                    organizer_country: country
                }
            },
            {
                $addFields: {
                    convertedEventId: { $toObjectId: "$event_id" },
                    convertedOrganizerId: { $toObjectId: "$organizer_id" }
                }
            },
            {
                $lookup: {
                    from: 'events',
                    localField: 'convertedEventId',
                    foreignField: '_id',
                    as: 'eventdata',
                }
            },
            {
                $lookup: {
                    from: 'organizers',
                    localField: 'convertedOrganizerId',
                    foreignField: '_id',
                    as: 'organizerdata',
                }
            },
            {
                $sort: {
                    createdAt: -1 // Sort by createdAt in descending order
                }
            }
        ]);
        res.status(200).json({
            success: true,
            data: List,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/update-event-tax", async (req, res, next) => {
    try {
        const {
            eventid,
            tixmefee,
            platformfee
        } = req.body;
        const update = await Event.updateOne({ _id: eventid }, {
            tixmefee,
            platformfee
        });
        if (update.modifiedCount === 1) {
            res.status(200).json({
                success: true,
                message: "Tax Updated"
            });
        } else {
            return next(new ErrorHandler("Try Again", 400));
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/fetch/event-tax", async (req, res, next) => {
    try {
        const { id } = req.body;
        const data = await Eventtax.findOne({ _id: id });
        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/delete/event-tax", async (req, res, next) => {
    try {
        const { id } = req.body;
        const data = await Eventtax.deleteOne({ _id: id });
        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/fetch/event-tax-list", async (req, res, next) => {
    try {
        const { id } = req.body;
        const data = await Eventtax.find({ eventid: id });
        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/insert/event-tax", async (req, res, next) => {
    try {
        const { uid, eventid, taxtitle, taxtype, taxamount,isglobal,ticketname,ticketid } = req.body;

        const insertData = {
            eventid,
            taxtitle,
            taxtype,
            taxamount,
            isglobal,
            ticketname,
            ticketid
        };

        if (uid) {
            await Eventtax.updateOne({ _id: uid }, { $set: insertData });
        } else {
            await Eventtax.create(insertData);
        }
        
        const list = await Eventtax.find({ eventid });
        res.status(200).json({
            success: true,
            data: list
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }

});
router.post("/delete/partner", async (req, res, next) => {
    try {
        const { upid } = req.body;
        const insertData = {
            isdelete: 1
        };
        await Partnerimg.updateOne({ _id: upid, isdelete: 0 }, { $set: insertData });
        const list = await Partnerimg.find({ isdelete: 0 });
        res.status(201).json({
            success: true,
            data: list
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/insert/partner", async (req, res, next) => {
    try {
        const { upid, img_url } = req.body;
        const insertData = {
            img_url,
            isdelete: 0
        };

        if (upid) {
            await Partnerimg.updateOne({ _id: upid }, { $set: insertData });
        } else {
            await Partnerimg.create(insertData);
        }

        const list = await Partnerimg.find({ isdelete: 0 });
        res.status(201).json({
            success: true,
            data: list
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/delete/customer", async (req, res, next) => {
    try {
        const { upid } = req.body;
        const insertData = {
            isdelete: 1
        };
        await Customer.updateOne({ _id: upid }, { $set: insertData });
        res.status(201).json({
            success: true,
            message: "Deleted Successfully"
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/restore/organizer", async (req, res, next) => {
    try {
        const { upid } = req.body;
        const insertData = {
            isdelete: 0
        };
        await Organizer.updateOne({ _id: upid }, { $set: insertData });
        res.status(201).json({
            success: true,
            message: "Restore Successfully"
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/delete/organizer", async (req, res, next) => {
    try {
        const { upid } = req.body;
        const insertData = {
            isdelete: 1
        };
        await Organizer.updateOne({ _id: upid }, { $set: insertData });
        res.status(201).json({
            success: true,
            message: "Deleted Successfully"
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/get-admin-details", async (req, res, next) => {
    try {
        const Data = await Admin.findOne({ role: 1 });
        res.status(201).json({
            success: true,
            data: Data
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/update-admin", async (req, res, next) => {
    try {
        const {
            img_url,
            userid,
            upid
        } = req.body;
        if (img_url) {
            await Admin.updateOne({ _id: upid }, { username: userid, picture: img_url });
        } else {
            await Admin.updateOne({ _id: upid }, { username: userid });
        }
        const Data = await Admin.findOne({ role: 1 });
        res.status(201).json({
            success: true,
            data: Data
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/update-password", async (req, res, next) => {
    try {
        const {
            newpass,
            oldpass,
            upid
        } = req.body;
        const result = await Admin.findOne({ _id: upid }).select("+password");
        if (result) {
            const isPasswordvalid = await result.comparePassword(oldpass);
            if (!isPasswordvalid) {
                return next(new ErrorHandler("Invalid old password", 400));
            }
            const updateData = {};
            updateData.password = await bcrypt.hash(newpass, 10);
            await Admin.updateOne({ _id: upid }, updateData);
            const Data = await Admin.findOne({ role: 1 });
            res.status(200).json({
                success: true,
                data: Data
            });
        } else {
            return next(new ErrorHandler("User not found", 400));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});


module.exports = router;