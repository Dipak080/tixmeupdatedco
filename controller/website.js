const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Event = require("../model/event");
const Order = require("../model/order");
const Partnerimg = require("../model/partnerimg");
const Hobby = require("../model/hobby");
const Ordersevent = require("../model/ordersevent");
const Organizer = require("../model/organizer");
const Subscribe = require("../model/subscribe");
const Coupon = require("../model/coupon");
const Couponredeemlog = require("../model/couponredeemlog");
const Walletupdatelog = require("../model/walletupdatelog");
const Followlog = require("../model/followlog");
const Saveeventlog = require("../model/saveeventlog");
const Packageplan = require("../model/packageplan");
const Customer = require("../model/customer");
const Orderitem = require("../model/orderitem");
const EventMaster = require("../model/eventmaster");
const Support = require("../model/support");
const Contact = require("../model/contact");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const sendMail = require("../utils/sendMail");
const bcrypt = require("bcryptjs");
const momenttimezone = require('moment-timezone');
const { AdminEmail, Imgurl, Mindate, DateValue, OnlyYear, TimeValue, TomorrowMinDate, getYearFromDate, getMonthFromDate, getSevenDaysAfter, getNextMonth, getNextMonthAndYear, generateUniqueIdentifier, CouponCode, mailHeader, mailFooter } = require("../utils/Helper");
const ErrorHandler = require("../utils/ErrorHandler");
router.post("/india-events", async (req, res, next) => {
    try {
        const status = 0;
        const isdelete = 0;
        const visibility = 1;
        const admin_publish = 1;
        const countryname = "India";
        list = await Event.find({ status, isdelete, visibility, admin_publish, countryname, start_mindate: { $gte: Mindate } }).limit(100).sort({ start_mindate: 1 });
        res.status(200).json({
            success: true,
            data: list,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/usa-events", async (req, res, next) => {
    try {
        const status = 0;
        const isdelete = 0;
        const visibility = 1;
        const admin_publish = 1;
        const countryname = "United States";
        list = await Event.find({ status, isdelete, visibility, admin_publish, countryname, start_mindate: { $gte: Mindate } }).limit(100).sort({ start_mindate: 1 });
        res.status(200).json({
            success: true,
            data: list,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/singapur-events", async (req, res, next) => {
    try {
        const status = 0;
        const isdelete = 0;
        const visibility = 1;
        const admin_publish = 1;
        const countryname = "Singapore";
        
        // Define the query criteria
        const query = { 
            status, 
            isdelete, 
            visibility, 
            admin_publish, 
            countryname 
        };

        // Find events based on query criteria
        const list = await Event.find(query).sort({ date: 1 });

        const filteredList = list.filter(event => {
            var startdate = momenttimezone(event.start_date).format('YYYYMMDD');
            var startDateMoment = momenttimezone(startdate, 'YYYYMMDD'); 
            if(typeof event.timezone == 'string'){
                finaltimezone = event.timezone;
            }else{
                finaltimezone = event.timezone.value
            }
            const currentDateTime = momenttimezone.tz(finaltimezone);
            const currentDate = currentDateTime.format('YYYYMMDD');
            const currentDateMoment = momenttimezone(currentDate, 'YYYYMMDD');
            const differenceInDays = currentDateMoment.diff(startDateMoment, 'days');
            return differenceInDays <= 3;

        });
        const sortedList = filteredList.sort((a, b) => {
            const format = 'D MMM YYYY';
            const dateA = momenttimezone(a.start_date, format);
            const dateB = momenttimezone(b.start_date, format);
            return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0;
        });
        res.status(200).json({
            success: true,
            data: sortedList,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/all-events-list", async (req, res, next) => {
    try {
        const { display_name,
            limit,
            organizerid,
            category,
            eventtype,
            tickettype,
            dateapitype,
            onlydate,
            fromdate,
            todate,
            minprice,
            maxprice,
            country,
            city,
            state,
            country_filter,
            india,
            singapur,
            usa
        } = req.body;
        const status = 0;
        const isdelete = 0;
        const visibility = 1;
        const admin_publish = 1;
        const conditions = { status, isdelete, visibility, admin_publish };
        // Add organizerid condition if it's provided and not null
        if (display_name) {
            conditions.$or = [
                { display_name: { $regex: new RegExp(display_name, 'i') } },
                { city: { $regex: new RegExp(display_name, 'i') } },
                { organizer_name: { $regex: new RegExp(display_name, 'i') } }
            ];
        }

        if (organizerid !== null) {
            conditions.organizer_id = organizerid;
        }
        if (category && Array.isArray(category) && category.length) {
            conditions.category = { $in: category };
        }

        if (country_filter && Array.isArray(country_filter) && country_filter.length) {
            conditions.countryname = { $in: country_filter };
        }

        if (eventtype) {
            conditions.eventtype = eventtype;
        }
        if (tickettype) {
            if (tickettype == 2) {
                // conditions.isfreeticket = 1;
                conditions.allprice = {
                    $elemMatch: {
                        ticket_type: 2,
                        isdelete: 0
                    }
                };
            }
            if (tickettype == 1) {
                // conditions.isfreeticket = { $ne: 1 };
                conditions.allprice = {
                    $elemMatch: {
                        ticket_type: 1,
                        isdelete: 0
                    }
                };
            }
        }
        conditions.start_mindate = {
            $gte: Mindate,
        };
        if (onlydate) {
            conditions.start_date = onlydate;
        }
        if (fromdate && todate) {
            conditions.start_mindate = {
                $gte: fromdate,
                $lte: todate
            };
        }

        if (minprice && maxprice) {
            if (minprice == 1 && maxprice < 100000000000000000000000000000000000000000000000000000000) {
                conditions.$or = [
                    { displayprice: { $gte: minprice, $lte: maxprice } },
                    { isfreeticket: !tickettype ? 1 : null }
                ];
            } else {
                conditions.displayprice = {
                    $gte: minprice, // Greater than or equal to minprice
                    $lte: maxprice
                };
            }
        }

        if (dateapitype) {
            if (dateapitype == 'Today') {
                const Today = Mindate;
                conditions.start_mindate = Today;
            }
            if (dateapitype == 'Tomorrow') {
                const date = TomorrowMinDate;
                conditions.start_mindate = Today;
            }
            if (dateapitype == 'This month') {
                const year = getYearFromDate(Mindate);
                const month = getMonthFromDate(Mindate);
                conditions.start_year = year;
                conditions.start_month = month;
            }
            if (dateapitype == 'Next month') {
                var nextmonth = getNextMonthAndYear(Mindate);
                conditions.start_yearmonth = nextmonth;
            }
            if (dateapitype == 'Next 7 days') {
                const SevenDaysdate = getSevenDaysAfter(Mindate);
                conditions.start_date = {
                    $gte: Mindate,
                    $lte: SevenDaysdate
                };
            }
        }
        // if (india || singapur || usa) {
        //     let orConditions = [];
        //     let countrySpecificConditions = [];
        //     if (india) countrySpecificConditions.push({ countryname: "India" });
        //     if (singapur) countrySpecificConditions.push({ countryname: "Singapore" });
        //     if (usa) countrySpecificConditions.push({ countryname: "United states" });
        //     if (countrySpecificConditions.length) orConditions.push({ $or: countrySpecificConditions });

        //     if (orConditions.length) conditions.$or = orConditions;
        // } else {
        //     if (country_filter) {
        //         conditions.countryname = { $regex: new RegExp(country_filter, 'i') };
        //     }
        // }

        const addRegexCondition = (field, value) => {
            if (value) {
                conditions[field] = { $regex: new RegExp(value, 'i') };
            }
        };

        // Search by City
        addRegexCondition('city', city);
        let list = await Event.find(conditions).limit(limit).sort({ start_mindate: 1 });

        // If no results, search by State
        // if (list.length === 0 && state) {
        //     delete conditions.city;
        //     addRegexCondition('state', state);
        //     list = await Event.find(conditions).limit(limit).sort({ start_mindate: 1 });
        // }

        // If still no results, search by Country
        // if (list.length === 0 && country) {
        //     delete conditions.state;
        //     addRegexCondition('countryname', country);
        //     list = await Event.find(conditions).limit(limit).sort({ start_mindate: 1 });
        // }
        // If still no results, search by nothing
        // if (list.length === 0) {
        //     delete conditions.countryname;
        //     list = await Event.find(conditions).limit(limit).sort({ start_mindate: 1 });
        // }
        res.status(200).json({
            success: true,
            data: list,
            category: category
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/check-follow-organizer", async (req, res, next) => {
    try {
        const { organizerid } = req.body;
        const bearerToken = req.headers.authorization;
        if (!bearerToken) {
            return next(new ErrorHandler("Unauthorized", 401));
        }
        const activation_token = bearerToken.split(' ')[1];
        const decodedToken = jwt.verify(
            activation_token,
            process.env.JWT_SECRET_KEY
        );
        if (!decodedToken) {
            return next(new ErrorHandler("Invalid token", 400));
        }
        const userid = decodedToken.id;
        const check = await Followlog.findOne({ userid: userid, organizerid: organizerid });
        if (check) {
            res.status(200).json({
                success: true
            });
        } else {
            res.status(200).json({
                success: false
            });
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/check-save-event", async (req, res, next) => {
    try {
        const { eventid } = req.body;
        const bearerToken = req.headers.authorization;
        if (!bearerToken) {
            return next(new ErrorHandler("Unauthorized", 401));
        }
        const activation_token = bearerToken.split(' ')[1];
        const decodedToken = jwt.verify(
            activation_token,
            process.env.JWT_SECRET_KEY
        );
        if (!decodedToken) {
            return next(new ErrorHandler("Invalid token", 400));
        }
        const userid = decodedToken.id;
        const check = await Saveeventlog.findOne({ userid: userid, eventid: eventid });
        if (check) {
            res.status(200).json({
                success: true
            });
        } else {
            res.status(200).json({
                success: false
            });
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/follow-organizer", async (req, res, next) => {
    try {
        const { organizerid } = req.body;
        const bearerToken = req.headers.authorization;
        if (!bearerToken) {
            return next(new ErrorHandler("Unauthorized", 401));
        }
        const activation_token = bearerToken.split(' ')[1];

        const decodedToken = jwt.verify(
            activation_token,
            process.env.JWT_SECRET_KEY
        );

        if (!decodedToken) {
            return next(new ErrorHandler("Invalid token", 400));
        }

        const userid = decodedToken.id;
        const check = await Followlog.findOne({ userid, organizerid: organizerid });
        const getOrganizer = await Organizer.findOne({ _id: organizerid });
        var status = 0;
        const currentfollowers = getOrganizer.followers ? getOrganizer.followers : 0;

        if (check) {
            await check.deleteOne();
            if (currentfollowers > 0) {
                const followtotal = currentfollowers - 1;
                const updateFollower = await Organizer.updateOne({ _id: organizerid }, { followers: followtotal });
            }
            var status = 1;
        } else {
            const getCustomer = await Customer.findOne({ _id: userid });
            const insert = await Followlog.create({
                username: getCustomer.name,
                useremail: getCustomer.email,
                userid: getCustomer._id,
                organizername: getOrganizer.name,
                organizeremail: getOrganizer.email,
                organizerid: getOrganizer._id,
                date: DateValue
            });

            if (currentfollowers > 0) {
                var followtotal = currentfollowers + 1;
            } else {
                var followtotal = 1;
            }
            const updateFollower = await Organizer.updateOne({ _id: organizerid }, { followers: followtotal });
            var status = 2;
        }
        const getFinaldata = await Organizer.findOne({ _id: organizerid });
        res.status(200).json({
            success: true,
            data: getFinaldata,
            typestatus: status
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/save-event", async (req, res, next) => {
    try {
        const { eventid } = req.body;
        const bearerToken = req.headers.authorization;
        if (!bearerToken) {
            return next(new ErrorHandler("Unauthorized", 401));
        }
        const activation_token = bearerToken.split(' ')[1];
        const decodedToken = jwt.verify(
            activation_token,
            process.env.JWT_SECRET_KEY
        );
        if (!decodedToken) {
            return next(new ErrorHandler("Invalid token", 400));
        }

        const userid = decodedToken.id;
        const check = await Saveeventlog.findOne({ userid, eventid: eventid });
        const getEventdata = await Event.findOne({ _id: eventid });
        var status = 0;
        if (check) {
            await check.deleteOne();
            var status = 1;
        } else {
            const getCustomer = await Customer.findOne({ _id: userid });
            const insert = await Saveeventlog.create({
                username: getCustomer.name,
                useremail: getCustomer.email,
                userid: getCustomer._id,
                eventid: getEventdata._id,
                eventname: getEventdata.display_name,
                start_date: getEventdata.start_date,
                start_time: getEventdata.start_time,
                end_date: getEventdata.end_date,
                end_time: getEventdata.end_time,
                organizerid: getEventdata.organizer_id,
                date: DateValue
            });
            var status = 2;
        }
        res.status(200).json({
            success: true,
            typestatus: status,
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/savedevents-list", async (req, res, next) => {
    try {
        const bearerToken = req.headers.authorization;
        if (!bearerToken) {
            return next(new ErrorHandler("Unauthorized", 401));
        }
        const activation_token = bearerToken.split(' ')[1];
        const decodedToken = jwt.verify(
            activation_token,
            process.env.JWT_SECRET_KEY
        );
        if (!decodedToken) {
            return next(new ErrorHandler("Invalid token", 400));
        }
        const userid = decodedToken.id;
        const list = await Saveeventlog.find({ userid: userid });
        const eventsIds = list.map(entry => entry.eventid);
        const eventList = await Event.find({ _id: { $in: eventsIds } });

        res.status(200).json({
            success: true,
            data: eventList
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/delete-saved-event", async (req, res, next) => {
    try {
        const { eventid } = req.body;
        const bearerToken = req.headers.authorization;
        if (!bearerToken) {
            return next(new ErrorHandler("Unauthorized", 401));
        }
        const activation_token = bearerToken.split(' ')[1];
        const decodedToken = jwt.verify(
            activation_token,
            process.env.JWT_SECRET_KEY
        );
        if (!decodedToken) {
            return next(new ErrorHandler("Invalid token", 400));
        }
        const userid = decodedToken.id;
        const list = await Saveeventlog.deleteOne({ userid: userid, eventid: eventid });
        res.status(200).json({
            success: true,
            message: "Removed"
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/following-organizer-list", async (req, res, next) => {
    try {
        const bearerToken = req.headers.authorization;
        if (!bearerToken) {
            return next(new ErrorHandler("Unauthorized", 401));
        }
        const activation_token = bearerToken.split(' ')[1];
        const decodedToken = jwt.verify(
            activation_token,
            process.env.JWT_SECRET_KEY
        );
        if (!decodedToken) {
            return next(new ErrorHandler("Invalid token", 400));
        }
        const userid = decodedToken.id;

        const list = await Followlog.aggregate([
            {
                $match: {
                    userid: userid
                }
            },
            {
                $addFields: {
                    convertedId: { $toString: "$organizerid" },
                    converOrgId: { $toObjectId: "$organizerid" },
                }
            },
            {
                $lookup: {
                    from: 'events',
                    let: { org_id: "$convertedId" }, // Use the converted ID as a variable
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$organizer_id", "$$org_id"] },
                                        { $eq: ["$status", 0] },
                                        { $eq: ["$isdelete", 0] },
                                        { $eq: ["$visibility", 1] },
                                        { $eq: ["$admin_publish", 1] },
                                        { $gte: ["$start_mindate", Mindate] }
                                    ]
                                }
                            }
                        },
                        {
                            $limit: 100
                        },
                        {
                            $sort: { start_mindate: 1 }
                        }
                    ],
                    as: 'orderData',
                }
            },
            {
                $lookup: {
                    from: 'organizers',
                    localField: 'converOrgId',
                    foreignField: '_id',
                    as: 'organizerData',
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $project: {
                    _id: 1,
                    username: 1,
                    useremail: 1,
                    userid: 1,
                    organizername: 1,
                    organizerid: 1,
                    organizeremail: 1,
                    date: 1,
                    eventDataCount: { $size: "$orderData" },
                    eventData: 1,  // Detailed event data, filtered and sorted as per your conditions
                    orderData: '$organizerData' // Only the first matched organizer
                }
            }
        ]);
        
        


        res.status(200).json({
            success: true,
            data: list
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/organizers-list", async (req, res, next) => {
    try {
        const list = await Organizer.aggregate([
            {
                $match: {
                    isactive: 1
                }
            },
            {
                $addFields: {
                    convertedId: { $toString: "$_id" }
                }
            },
            {
                $lookup: {
                    from: 'events',
                    let: { org_id: "$convertedId" }, // Use the converted ID as a variable
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$organizer_id", "$$org_id"] },
                                        { $eq: ["$status", 0] },
                                        { $eq: ["$isdelete", 0] },
                                        { $eq: ["$visibility", 1] },
                                        { $eq: ["$admin_publish", 1] },
                                        { $gte: ["$start_mindate", Mindate] }
                                    ]
                                }
                            }
                        },
                        {
                            $limit: 100
                        },
                        {
                            $sort: { start_mindate: 1 }
                        }
                    ],
                    as: 'eventData',
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    first_name: 1,
                    last_name: 1,
                    countryname: 1,
                    email: 1,
                    phone_number: 1,
                    followers: 1,
                    address: 1,
                    profile_picture: 1,
                    eventDataCount: { $size: "$eventData" }
                }
            },
            {
                $sort: {
                    createdAt: -1 // Sort by createdAt in descending order
                }
            },
        ]);


        res.status(200).json({
            success: true,
            data: list
        });


    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/organizer-details", async (req, res, next) => {
    try {
        const { id } = req.body;
        const list = await Organizer.findOne({ _id: id }).sort({ name: 1 }).exec();
        const organizerEvent = await Event.find({ organizer_id: id, visibility: 1, isdelete: 0 }).sort({ start_data_min: 1 }).exec();
        res.status(200).json({
            success: true,
            data: list,
            events: organizerEvent,
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/organizer/support/insert", async (req, res, next) => {
    try {
        const {
            id,
            tickettype,
            priority,
            message,
            eventid,
            customerid
        } = req.body;
        const OrganizerData = await Organizer.findOne({ _id: id });
        const isdelete = 0;
        const isclose = 0;
        const uniqueid = generateUniqueIdentifier;
        const mindate = Mindate;
        const date = DateValue;
        const insertData = await Support.create({
            email: OrganizerData.email,
            userid: OrganizerData._id,
            profiledata: OrganizerData,
            usertype: "organizer",
            message,
            isdelete,
            time: TimeValue,
            eventid: eventid ? eventid : null,
            customerid: customerid ? customerid : null,
            uniqueid,
            isclose,
            tickettype,
            priority,
            mindate,
            date
        });
        if (customerid && eventid) {
            await Ordersevent.updateMany({ customer_id: customerid, event_id: eventid }, { is_support: 1 });
        }
        res.status(201).json({
            success: true,
            data: insertData
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/customer/support/insert", async (req, res, next) => {
    try {
        const {
            tickettype,
            priority,
            message,
            eventid,
            isfororganizer,
            eventmainid
        } = req.body;
        const bearerToken = req.headers.authorization;
        if (!bearerToken) {
            return next(new ErrorHandler("Unauthorized", 401));
        }
        const activation_token = bearerToken.split(' ')[1];

        const decodedToken = jwt.verify(
            activation_token,
            process.env.JWT_SECRET_KEY
        );

        if (!decodedToken) {
            return next(new ErrorHandler("Invalid token", 400));
        }

        const userid = decodedToken.id;
        const CustomerData = await Customer.findOne({ _id: userid });
        const isdelete = 0;
        const isclose = 0;
        const uniqueid = generateUniqueIdentifier;
        const mindate = Mindate;
        const date = DateValue;
        const insertData = await Support.create({
            email: CustomerData.email,
            userid: CustomerData._id,
            profiledata: CustomerData,
            usertype: "customer",
            message,
            isdelete,
            time: TimeValue,
            eventid: eventid ? eventid : null,
            eventmainid: eventmainid ? eventmainid : null,
            isfororganizer: isfororganizer ? isfororganizer : null,
            uniqueid,
            isclose,
            tickettype,
            priority,
            mindate,
            date
        });
        if (eventmainid) {
            await Ordersevent.updateOne({ _id: eventmainid }, { is_support: 1 });
        }
        res.status(201).json({
            success: true,
            data: insertData
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/customer/support/list", async (req, res, next) => {
    try {
        const bearerToken = req.headers.authorization;
        if (!bearerToken) {
            return next(new ErrorHandler("Unauthorized", 401));
        }
        const activation_token = bearerToken.split(' ')[1];

        const decodedToken = jwt.verify(
            activation_token,
            process.env.JWT_SECRET_KEY
        );

        if (!decodedToken) {
            return next(new ErrorHandler("Invalid token", 400));
        }

        const userid = decodedToken.id;
        const isdelete = 0;
        const CustomerData = await Customer.findOne({ _id: userid });
        const list = await Support.find({ email: CustomerData.email, isdelete, usertype: "customer" }).sort({ _id: -1 }).exec();
        res.status(200).json({
            success: true,
            data: list
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/organizer/support/list", async (req, res, next) => {
    try {
        const { id } = req.body;
        const OrganizerData = await Organizer.findOne({ _id: id });
        const list = await Support.find({
            $or: [
                { email: OrganizerData.email },
                { isfororganizer: id },
            ],
            isdelete: 0
        }).sort({ _id: -1 }).exec();
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
            usertype,
            closestatus
        } = req.body;
        const date = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');
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
        if (closestatus) {
            const updateclose = await Support.updateOne({ _id: id }, { isclose: closestatus ? closestatus : null });
        }
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
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/contact-store", async (req, res, next) => {
    try {
        const {
            first_name,
            last_name,
            name,
            email,
            phone,
            subject,
            areyou,
            message
        } = req.body;
        const insertData = await Contact.create({
            first_name,
            last_name,
            name,
            email,
            phone,
            subject,
            areyou,
            message,
            mindate: Mindate,
            date: DateValue,
            time: TimeValue,
            isdelete: 0
        });
        const emailTemplate = `${mailHeader()}
            <div class="email-container">
            <div class="email-body">
                <div class="email-additional-content">
                    <div>
                        <p>Hello,</p>
                        <p>You have received a new contact inquiry from your website. Here are the details:</p>
                        <p>Name: ${first_name + ' ' + last_name}</p>
                        <p>Email: ${email}</p>
                        <p>Phone Number: ${phone}</p>
                        <p>Subject: ${subject}</p>
                        <p>Type: ${areyou}</p>
                        <p>Message: ${message}</p>
                        <p>Best Regards,<br>Tixme</p>
                    </div>        
                </div>
            </div>
            ${mailFooter()}
          `;
        await sendMail({
            email: AdminEmail(),
            subject: 'Contact Form',
            message: emailTemplate,
            isHtml: true,
        });
        res.status(201).json({
            success: true,
            data: "Contact us form submitted successfully"
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/get-user-details", async (req, res, next) => {
    try {
        const {
            id
        } = req.body;
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
router.post("/get-user-package", async (req, res, next) => {
    try {
        const bearerToken = req.headers.authorization;
        if (!bearerToken) {
            return next(new ErrorHandler("Unauthorized", 401));
        }
        const activation_token = bearerToken.split(' ')[1];

        const decodedToken = jwt.verify(
            activation_token,
            process.env.JWT_SECRET_KEY
        );

        if (!decodedToken) {
            return next(new ErrorHandler("Invalid token", 400));
        }
        const userid = decodedToken.id;
        const data = await Customer.findOne({ _id: userid });
        if (!data) {
            return next(new ErrorHandler("User not found", 400));
        } else {
            if (data.planid) {
                const wallet = data.wallet > 0 ? data.wallet : 0;
                res.status(200).json({
                    success: true,
                    data: wallet,
                });
            } else {
                return next(new ErrorHandler("No plan found", 400));
            }
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/update-organizer-details", async (req, res, next) => {
    try {
        const { bank_country_value, bank_country_label, first_name, last_name, id, bankaccount, bankname, holdername, swiftcode, profile_picture } = req.body;
        const name = first_name + ' ' + last_name;
        const updateData = {};
        updateData.name = name;
        updateData.first_name = first_name;
        updateData.last_name = last_name;
        updateData.bankaccount = bankaccount;
        updateData.bankname = bankname;
        updateData.holdername = holdername;
        updateData.swiftcode = swiftcode;
        updateData.bank_country_value = bank_country_value;
        updateData.bank_country_label = bank_country_label;
        if (profile_picture) {
            updateData.profile_picture = Imgurl + profile_picture;
        }
        const Update = await Organizer.updateOne({ _id: id }, updateData);
        await Event.updateMany({ organizer_id: id }, { organizer_name: first_name });
        if (profile_picture) {
            await Event.updateMany({ organizer_id: id }, { organizer_logo: Imgurl + profile_picture });
        }
        if (Update.modifiedCount === 1) {
            res.status(200).json({
                success: true,
                data: 'Updated successfully'
            });
        } else {
            return next(new ErrorHandler("Update failed", 400));
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/update-user-details", async (req, res, next) => {
    try {
        const { id, hobbies, first_name, last_name, email, whatsapp_no, phone_number, address, pincode, picture,
            city,
            state,
            country,
            cityvalue,
            statevalue,
            countryvalue,
        } = req.body;
        const userid = id;
        const name = first_name + ' ' + last_name;
        const checkEmail = await Customer.findOne({ email, _id: { $ne: userid } });
        if (checkEmail) {
            return next(new ErrorHandler("Email already exist", 401));
        }
        const updateData = {};
        updateData.name = name;
        if (picture) {
            updateData.picture = Imgurl + picture;
        }
        updateData.first_name = first_name;
        updateData.last_name = last_name;
        updateData.hobbies = hobbies;
        updateData.email = email;
        updateData.whatsapp_no = whatsapp_no;
        updateData.phone_number = phone_number;
        updateData.address = address;
        updateData.pincode = pincode;
        updateData.city = city ? city : null;
        updateData.state = state ? state : null;
        updateData.country = country ? country : null;
        updateData.cityvalue = cityvalue ? cityvalue : null;
        updateData.statevalue = statevalue ? statevalue : null;
        updateData.countryvalue = countryvalue ? countryvalue : null;
        const Update = await Customer.updateOne({ _id: userid }, updateData);
        if (Update.modifiedCount === 1) {
            res.status(200).json({
                success: true,
                data: 'Updated successfully'
            });
        } else {
            return next(new ErrorHandler("Update failed", 400));
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/update-organizer-email", async (req, res, next) => {
    try {
        const { email, password, id } = req.body;
        const getOrganizerDetails = await Organizer.findOne({ _id: id }).select("+password");
        const isPasswordvalid = await getOrganizerDetails.comparePassword(password);
        if (!isPasswordvalid) {
            return next(new ErrorHandler("Invalid password", 400));
        }
        const checkEmail = await Organizer.findOne({ email, _id: { $ne: id } });
        if (checkEmail) {
            return next(new ErrorHandler("Email already exist", 401));
        }
        const result = await Organizer.updateOne({ _id: id }, { email });
        if (result.modifiedCount === 1) {
            res.status(200).json({
                success: true,
                data: 'Email updated successfully'
            });
        } else {
            return next(new ErrorHandler("Update failed", 400));
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/update-user-email", async (req, res, next) => {
    try {
        const { id, email, password } = req.body;
        const userid = id;
        const checkEmail = await Customer.findOne({ email, _id: { $ne: userid } });
        if (checkEmail) {
            return next(new ErrorHandler("Email already exist", 401));
        }
        const userData = await Customer.findOne({ _id: userid }).select("+password");
        const isPasswordvalid = await userData.comparePassword(password);
        if (!isPasswordvalid) {
            return next(new ErrorHandler("Password not match", 400));
        }
        const updateData = {};
        updateData.email = email;
        const Update = await Customer.updateOne({ _id: userid }, updateData);
        if (Update.modifiedCount === 1) {
            res.status(200).json({
                success: true,
                data: 'Updated successfully'
            });
        } else {
            return next(new ErrorHandler("Update failed", 400));
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/update-organizer-password", async (req, res, next) => {
    try {

        const { password, id, oldpassword } = req.body;
        const getOrganizerDetails = await Organizer.findOne({ _id: id }).select("+password");
        const isPasswordvalid = await getOrganizerDetails.comparePassword(oldpassword);
        if (!isPasswordvalid) {
            return next(new ErrorHandler("Invalid password", 400));
        }
        const updateData = {};
        updateData.password = await bcrypt.hash(password, 10);
        const result = await Organizer.updateOne({ _id: id }, updateData);
        if (result.modifiedCount === 1) {
            res.status(200).json({
                success: true,
                data: 'Password changed successfully'
            });
        } else {
            return next(new ErrorHandler("Update failed", 400));
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/update-user-password", async (req, res, next) => {
    try {
        const { id, password, oldpassword } = req.body;
        const userid = id;
        const getCustomerData = await Customer.findOne({ _id: userid }).select("+password");
        const isPasswordvalid = await getCustomerData.comparePassword(oldpassword);
        if (!isPasswordvalid) {
            return next(new ErrorHandler("Old password not match", 400));
        }
        const updateData = {};
        updateData.password = await bcrypt.hash(password, 10);
        const result = await Customer.updateOne({ _id: userid }, updateData);
        if (result.modifiedCount === 1) {
            res.status(200).json({
                success: true,
                data: 'Password changed successfully'
            });
        } else {
            return next(new ErrorHandler("Update failed", 400));
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/send-email", async (req, res, next) => {
    try {
        await sendMail({
            email: "dipakbarman080@gmail.com",
            subject: "Activate your account",
            message: `Hello test, please click on the link to activate your account:`,
        });
        res.status(201).json({
            success: true,
            message: `please check your email:-  to activate your account!`,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});
router.post("/hobby/list", async (req, res, next) => {
    try {
        const list = await Hobby.find({ isdelete: 0 });
        res.status(200).json({
            success: true,
            data: list
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/subscribe-insert", async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const check = await Subscribe.findOne({ email });
        if (!check) {
            await Subscribe.create({ name, email });
            res.status(200).json({
                success: true,
                message: "Thank you !"
            });
        } else {
            res.status(400).json({
                success: false,
                message: "You are already part of the newsletter !"
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/get-redeem-coupon-list", async (req, res, next) => {
    try {
        const { id } = req.body;
        const userid = id;
        const CouponList = await Couponredeemlog.aggregate([
            {
                $match: {
                    customerid: userid
                }
            },
            {
                $addFields: {
                    convertedOrderId: { $toObjectId: "$couponid" }
                }
            },
            {
                $lookup: {
                    from: 'coupons',
                    localField: 'convertedOrderId',
                    foreignField: '_id',
                    as: 'coupondata',
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
            data: CouponList
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/redeem-coupon", async (req, res, next) => {
    try {
        const bearerToken = req.headers.authorization;
        if (!bearerToken) {
            return next(new ErrorHandler("Unauthorized", 401));
        }
        const activation_token = bearerToken.split(' ')[1];
        const decodedToken = jwt.verify(
            activation_token,
            process.env.JWT_SECRET_KEY
        );
        if (!decodedToken) {
            return next(new ErrorHandler("Invalid token", 400));
        }
        const userid = decodedToken.id;
        const { id } = req.body;
        const getUserdata = await Customer.findOne({ _id: userid });
        if (!getUserdata) {
            return next(new ErrorHandler("User Not found", 400));
        }
        const rewardpoint = getUserdata.wallet ? getUserdata.wallet : 0;
        if (rewardpoint >= 0) {
            const getCouponid = await Coupon.findOne({ _id: id, isdelete: 0 });
            if (getCouponid) {
                if (getCouponid.point <= rewardpoint) {
                    const TotalPoint = parseInt(getUserdata.wallet) - parseInt(getCouponid.point);
                    await Walletupdatelog.create({
                        userid: getUserdata._id,
                        useremail: getUserdata.email,
                        amount: getCouponid.point,
                        userwallet: TotalPoint,
                        amounttype: "Debit",
                        date: DateValue,
                        mindate: Mindate,
                        time: TimeValue
                    });
                    await Customer.updateOne({ _id: getUserdata._id }, { wallet: TotalPoint });
                    await Couponredeemlog.create({
                        customerid: getUserdata._id,
                        tokenno: CouponCode,
                        couponid: getCouponid._id,
                        coupondiscount: getCouponid.discount,
                        isvalid: 0,
                    });
                    res.status(200).json({
                        success: true,
                        message: "Success"
                    });
                } else {
                    return next(new ErrorHandler("Insufficient points", 400));
                }
            } else {
                return next(new ErrorHandler("Invalid coupon", 400));
            }
            res.status(200).json({
                success: true,
                data: list
            });
        } else {
            return next(new ErrorHandler("Insufficient points", 400));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/get-coupon-list", async (req, res, next) => {
    try {
        const { id } = req.body;
        const userid = id

        const getUserdata = await Customer.findOne({ _id: userid });
        if (!getUserdata) {
            return next(new ErrorHandler("User Not found", 400));
        }
        const rewardpoint = getUserdata.wallet ? getUserdata.wallet : 0;
        if (rewardpoint >= 0) {
            const list = await Coupon.find({
                point: { $lte: rewardpoint },
                isdelete: 0
            });
            res.status(200).json({
                success: true,
                data: list
            });
        } else {
            res.status(200).json({
                success: true,
                data: []
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/check-coupon-valid", async (req, res, next) => {
    try {
        const bearerToken = req.headers.authorization;
        if (!bearerToken) {
            return next(new ErrorHandler("Unauthorized", 401));
        }
        const activation_token = bearerToken.split(' ')[1];
        const decodedToken = jwt.verify(
            activation_token,
            process.env.JWT_SECRET_KEY
        );
        if (!decodedToken) {
            return next(new ErrorHandler("Invalid token", 400));
        }
        const userid = decodedToken.id;
        const { couponno } = req.body;
        const checkcoupon = await Couponredeemlog.findOne({ customerid: userid, tokenno: couponno });
        if (!checkcoupon) {
            return next(new ErrorHandler("Invalid coupon code", 400));
        }
        if (checkcoupon.isvalid != 0) {
            return next(new ErrorHandler("Coupon already used", 400));
        }
        const getCoupon = await Coupon.findOne({ _id: checkcoupon.couponid });
        res.status(200).json({
            success: true,
            data: getCoupon,
            customer_coupon: checkcoupon,
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

router.post("/get-event-attendence-byname", async (req, res, next) => {
    try {
        const { eventid, name } = req.body;
        const List = await Ordersevent.aggregate([
            {
                $match: {
                    event_id: eventid,
                    status: "1",
                    ticket_name: name
                }
            },
            {
                $addFields: {
                    convertedCustomer_id: { $toObjectId: "$customer_id" }
                }
            },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'convertedCustomer_id',
                    foreignField: '_id',
                    as: 'orderData',
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
router.post("/get-event-attendence", async (req, res, next) => {
    try {
        const { eventid } = req.body;
        const List = await Ordersevent.aggregate([
            {
                $match: {
                    event_id: eventid,
                    status: "1"
                }
            },
            {
                $addFields: {
                    convertedCustomer_id: { $toObjectId: "$customer_id" }
                }
            },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'convertedCustomer_id',
                    foreignField: '_id',
                    as: 'orderData',
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
router.get("/homecountdata", async (req, res, next) => {
    try {
        // Execute counting operations concurrently
        const [EventsHosted, TicketsSold, OrganizerCount] = await Promise.all([
            Event.countDocuments({ visibility: 1 }),
            Ordersevent.countDocuments({ status: 1 }),
            Organizer.countDocuments({ isactive: 1 })
        ]);

        // Send the response with the actual counts
        res.status(200).json({
            success: true,
            data: { EventsHosted, TicketsSold, OrganizerCount }
        });
    } catch (error) {
        // If an error occurs, pass it to the error handling middleware
        return next(new ErrorHandler(error.message, 400));
    }
});
// partner image website
router.get("/partnerslist", async (req, res, next) => {
    try {
        const list = await Partnerimg.find({ isdelete: 0 });
        res.status(200).json({
            success: true,
            data: list
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.get("/get-events", async (req, res, next) => {
    try {
        const status = 0;
        const isdelete = 0;
        const visibility = 1;
        const admin_publish = 1;
        const countryname = "Singapore";
        
        // Define the query criteria
        const query = { 
            status, 
            isdelete, 
            visibility, 
            admin_publish, 
            countryname 
        };

        // Find events based on query criteria
        const list = await Event.find(query)
        .select('name category_name thum_image thum_image start_date event timezone')
        .sort({ date: 1 });
        
        const filteredList = list.filter(event => {
            var startdate = momenttimezone(event.start_date).format('YYYYMMDD');
            var startDateMoment = momenttimezone(startdate, 'YYYYMMDD'); 
            let finaltimezone = typeof event.timezone === 'string' ? event.timezone : event.timezone.value;
            const currentDateTime = momenttimezone.tz(finaltimezone);
            const currentDate = currentDateTime.format('YYYYMMDD');
            const currentDateMoment = momenttimezone(currentDate, 'YYYYMMDD');
            const differenceInDays = currentDateMoment.diff(startDateMoment, 'days');
            return differenceInDays <= 3;
        });

        const sortedList = filteredList.sort((a, b) => {
            const format = 'D MMM YYYY';
            const dateA = momenttimezone(a.start_date, format);
            const dateB = momenttimezone(b.start_date, format);
            return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0;
        });

        // Add event link to each event
        const enrichedList = sortedList.map(event => {
            // Replace spaces with dashes
            const formattedName = event.name.replace(/\s+/g, '-');
            const eventLink = `https://tixme.co/event/${event._id}/${formattedName}`;
            return { 
                ...event.toObject(), // Convert the mongoose document to a plain object
                eventLink 
            };
        });

        res.status(200).json({
            success: true,
            data: enrichedList,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

router.post("/app-get-events", async (req, res, next) => {
    try {
        const status = 0;
        const isdelete = 0;
        const visibility = 1;
        const admin_publish = 1;
        const { organizer_id } = req.body; // Use req.body to get the organizer_id

        if (!organizer_id) {
            return res.status(400).json({
                success: false,
                message: 'Organizer ID is required',
            });
        }

        // Define the query criteria
        const query = { 
            status, 
            isdelete, 
            visibility, 
            admin_publish,
            organizer_id // Use organizer_id in the query
        };

        // Find events based on query criteria
        const list = await Event.find(query)
            .select('name category_name thum_image start_date event timezone start_time countryname')
            .sort({ start_date: 1 }); // Ensure sorting by correct field name

        // Filter the events based on the start date criteria
        const filteredList = list.filter(event => {
            const startdate = momenttimezone(event.start_date).format('YYYYMMDD');
            const startDateMoment = momenttimezone(startdate, 'YYYYMMDD'); 
            const finaltimezone = typeof event.timezone === 'string' ? event.timezone : event.timezone.value;
            const currentDateTime = momenttimezone.tz(finaltimezone);
            const currentDate = currentDateTime.format('YYYYMMDD');
            const currentDateMoment = momenttimezone(currentDate, 'YYYYMMDD');
            const differenceInDays = currentDateMoment.diff(startDateMoment, 'days');
            return differenceInDays <= 50;
        });

        // Sort events by start date
        const sortedList = filteredList.sort((a, b) => {
            const format = 'D MMM YYYY';
            const dateA = momenttimezone(a.start_date, format);
            const dateB = momenttimezone(b.start_date, format);
            return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0;
        });

        // Prepare a list with event links and add count
        const enrichedList = await Promise.all(sortedList.map(async event => {
            // Replace spaces with dashes for event name
            const formattedName = event.name.replace(/\s+/g, '-');
          
            // Count documents in Orderitem collection for this event
            const count = await Orderitem.countDocuments({ eventid: event._id.toString(), scan_status: 1 });

            return { 
                ...event.toObject(), // Convert the mongoose document to a plain object
                count // Add the count to the event
            };
        }));

        // Send the enriched event list in the response
        res.status(200).json({
            success: true,
            data: enrichedList,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.get("/eventmasterdata", async (req, res, next) => {
    try {
        // Find events based on query criteria
        const list = await EventMaster.find()
        res.status(200).json({
            success: true,
            data: list,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
module.exports = router;