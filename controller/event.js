const express = require("express");
const Event = require("../model/event");
const Organizer = require("../model/organizer");
const Ordersevent = require("../model/ordersevent");
const Seatmap = require("../model/seatmap");
const Mailbox = require("../model/mailbox");
const Customer = require("../model/customer");
const Followlog = require("../model/followlog");
const sendMail = require("../utils/sendMail");
const Order = require("../model/order");
const Orderitem = require("../model/orderitem");
const Eventpayout = require("../model/eventpayout");
const moment = require('moment');
const jwt = require("jsonwebtoken");
const axios = require('axios');
const router = express.Router();
const { generateUUID } = require('../utils/Uuid');
const ErrorHandler = require("../utils/ErrorHandler");
const { Imgurl, CalculateDuration, Mindate, DateValue, TimeValue, TomorrowMinDate, OnlyYear, getYearFromDate, getMonthFromDate, getNextMonthAndYear, generateTenDigitNumber, mailHeader, AdminEmail, mailFooter } = require("../utils/Helper");
const fs = require('fs');
const path = require('path');
const multer = require("multer");
const seatmaplog = require("../model/seatmaplog");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.fnow();
        cb(null, uniqueSuffix + file.originalname);
    },
});
const upload = multer({ storage: storage });
// create user
router.post("/create", async (req, res, next) => {
    try {
        const {
            seatmap,
            lat,
            Lag,
            start_mindate,
            end_mindate,
            countryname,
            currencycode,
            countrysymbol,
            timezone,
            end_data_min,
            start_data_min,
            displayprice,
            eventtypecategory,
            eventtypecategory_name,
            eventtype,
            event_type_name,
            name,
            display_name,
            type,
            category,
            category_name,
            tags,
            visibility,
            location,
            event_subtype_id,
            start_date,
            start_time,
            start_time_min,
            end_date,
            end_time,
            end_time_min,
            is_clock_countdown,
            isendtimeoptional,
            is_selling_fast,
            tickethide,
            is_soldout,
            display_start_time,
            display_end_time,
            organizer_id,
            status,
            city,
            state,
            pincode,
            displayaddress,
            eventjoinurl
        } = req.body;
        const organizer_data = await Organizer.findOne({ _id: organizer_id });
        const organizer_name = organizer_data.first_name;
        const organizer_logo = organizer_data.profile_picture ? organizer_data.profile_picture : null;

        const isdelete = 0;
        const start_year = getYearFromDate(start_mindate);
        const start_month = getMonthFromDate(start_mindate);
        const start_yearmonth = getNextMonthAndYear(start_mindate);
        const mindate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const date = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');
        const event_duration = CalculateDuration(start_mindate, start_time, end_mindate, end_time);
        const insertData = await Event.create({
            isdelete,
            seatmap,
            uniqueid: generateTenDigitNumber(),
            mindate,
            event_duration,
            start_mindate,
            start_month,
            start_year,
            lat,
            organizer_logo,
            Lag,
            end_mindate,
            countryname,
            currencycode,
            start_yearmonth,
            countrysymbol,
            timezone,
            date,
            displayprice,
            eventtype,
            start_data_min,
            end_data_min,
            event_type_name,
            name,
            display_name,
            type,
            category,
            category_name,
            eventtypecategory,
            eventtypecategory_name,
            tags,
            visibility,
            admin_publish: 2,
            location,
            city,
            state,
            pincode,
            displayaddress,
            event_subtype_id,
            start_date,
            start_time,
            start_time_min,
            end_date,
            end_time,
            end_time_min,
            is_clock_countdown,
            isendtimeoptional,
            is_selling_fast,
            tickethide,
            is_soldout,
            display_start_time,
            display_end_time,
            organizer_id,
            organizer_name,
            status,
            eventjoinurl
        });
        res.status(201).json({
            success: true,
            data: insertData._id
        });

    } catch (error) {
        return next(new ErrorHandler('Unable to save the data, please try again', 400));
    }
});
router.post("/update", async (req, res, next) => {
    try {
        const { seatmap, displayaddress, eventjoinurl, lat, Lag, start_mindate, end_mindate, countryname, currencycode, countrysymbol, timezone, updateid, end_data_min, start_data_min, displayprice, displaycutprice, eventtype, event_type_name, name, display_name, type, category, category_name, tags, visibility, location, event_subtype_id, start_date, start_time, end_date, end_time, is_clock_countdown,isendtimeoptional, is_selling_fast,tickethide, is_soldout, display_start_time, display_end_time, organizer_id, status, city, state, pincode, start_time_min, end_time_min } = req.body;
        // const organizer_data = await Organizer.findOne({ _id: organizer_id });
        // const organizer_name = organizer_data.first_name;
        const CheckEventpublish = await Event.findOne({ _id: updateid });
        const isdelete = 0;
        const mindate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const date = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');
        const event_duration = CalculateDuration(start_mindate, start_time, end_mindate, end_time);
        const updateData = await Event.updateOne({ _id: updateid }, {
            isdelete,
            seatmap,
            mindate,
            date,
            start_mindate,
            event_duration,
            end_mindate,
            countryname,
            currencycode,
            countrysymbol,
            timezone,
            lat,
            Lag,
            displayprice,
            displaycutprice,
            eventtype,
            start_data_min,
            end_data_min,
            event_type_name,
            name,
            display_name,
            type,
            category,
            category_name,
            tags,
            visibility,
            location,
            event_subtype_id,
            start_date,
            start_time,
            start_time_min,
            end_date,
            end_time,
            end_time_min,
            is_clock_countdown,
            isendtimeoptional,
            is_selling_fast,
            is_soldout,
            display_start_time,
            display_end_time,
            status,
            city,
            state,
            pincode,
            displayaddress,
            eventjoinurl
        });
        const updatedEvent = await Event.findOne({ _id: updateid });
        const Orgdata = await Organizer.findOne({ _id: updatedEvent.organizer_id });
        if (CheckEventpublish.visibility == 2) {
            if (visibility == 1) {
                const emailTemplate = `${mailHeader()}
                <div class="email-container">
                <div class="email-body">
                <div>                
                <p>I hope this message finds you well. I am writing to request your approval for the upcoming event we have planned. Below are the details:</p>
                <div>
                    <p><strong>Event Name:</strong> ${updatedEvent && updatedEvent.display_name}</p>
                    <p><strong>Date and Time:</strong> ${updatedEvent && updatedEvent.start_date} ${updatedEvent.start_time}</p>
                    <p><strong>Venue:</strong> ${updatedEvent && updatedEvent.displayaddress}</p>
                    <p><strong>Country:</strong> ${updatedEvent && updatedEvent.countryname}</p>
                    <p><strong>Category:</strong> ${updatedEvent && updatedEvent.category_name}</p>
                    <p><strong>Organizer Name:</strong> ${Orgdata && Orgdata.first_name} ${Orgdata && Orgdata.last_name}</p>
                    <p><strong>Organizer Email:</strong> ${Orgdata && Orgdata.email}</p>
                </div>
                <p>Please review details and let me know if you have any questions or require additional information. Your approval is essential for us to proceed with the preparations.</p>
                <p>Thank you for your attention to this matter.</p>
                <p>Best regards,</p>
            </div>
            
                </div>
                ${mailFooter()}
              `;
                await sendMail({
                    email: AdminEmail(),
                    subject: 'Event Approval Request',
                    message: emailTemplate,
                    isHtml: true,
                });
            }
        }

        if (updateData.modifiedCount === 1) {
            res.status(200).json({
                success: true,
                data: 'Updated'
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
router.post("/update/eventdesc", async (req, res, next) => {
    try {
        const { updateid, event_desc } = req.body;
        const result = await Event.updateOne({ _id: updateid }, { event_desc });

        if (result.modifiedCount === 1) {
            res.status(200).json({
                success: true,
                data: 'Updated successfully'
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
router.post("/update/eventdesc-ex", upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'bannerimage', maxCount: 1 }
]), async (req, res, next) => {
    try {
        const updateid = req.body.updateid;
        const event_desc = req.body.event_desc;
        await Event.updateOne({ _id: updateid }, { event_desc });
        // Retrieve the existing event details
        const existingEvent = await Event.findById(updateid);
        if (!existingEvent) {
            return res.status(404).json({ success: false, data: 'Event not found' });
        }

        // Function to delete a file
        const deleteFileIfExists = (filename) => {
            const filePath = path.join('uploads/', filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        };

        // Check and delete existing image if a new one is uploaded
        if (req.files['image'] && req.files['image'].length > 0) {
            if (existingEvent.thum_image) {
                deleteFileIfExists(existingEvent.thum_image);
            }
            // Update with the new image name
            existingEvent.thum_image = req.files['image'][0].filename;
        }

        if (req.files['bannerimage'] && req.files['bannerimage'].length > 0) {
            if (existingEvent.banner_image) {
                deleteFileIfExists(existingEvent.banner_image);
            }
            // Update with the new banner image name
            existingEvent.banner_image = req.files['bannerimage'][0].filename;
        }

        // Update the database with the new details
        await existingEvent.save();

        res.status(200).json({
            success: true,
            data: 'Updated',
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/events/eventwiseticket", async (req, res, next) => {
    try {
        const { eventid } = req.body;
        const list = await Event.find({ _id: eventid }).select('allprice').sort({ _id: -1 }).exec();
        res.status(200).json({
            success: true,
            data: list,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/upload-image", async (req, res, next) => {
    try {
        const {
            updateid,
            name,
            type } = req.body;
        const fileurl = Imgurl + name;
        const getData = await Event.findOne({ _id: updateid });
        const deleteImage = async (imageUrl) => {
            const filename = imageUrl.split('/').pop();
            try {
                const response = await axios.post('https://tixme.co/tixme_storage/api/delete-image', { file_name: filename });

            } catch (error) {
                console.error('Error deleting the image:', error);
                // Handle error accordingly
            }
        };
        if (type == 'thumbnail') {
            if (getData.thum_image && getData.thum_image != null) {
                await deleteImage(getData.thum_image);
            }
            const Update = await Event.updateOne({ _id: updateid }, { thum_image: fileurl });
            if (Update.modifiedCount === 1) {
                res.status(201).json({
                    success: true,
                    data: 'Updated'
                });
            } else {
                res.status(404).json({
                    success: false,
                    data: 'Upload failed try again'
                });
            }
        }
        if (type == 'banner') {
            if (getData.banner_image) {
                await deleteImage(getData.banner_image);
            }
            const Update = await Event.updateOne({ _id: updateid }, { banner_image: fileurl });
            if (Update.modifiedCount === 1) {
                res.status(201).json({
                    success: true,
                    data: 'Updated'
                });
            } else {
                res.status(404).json({
                    success: false,
                    data: 'Upload failed try again'
                });
            }
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/create/event-ticket", async (req, res, next) => {
    try {
        const {
            updateid,
            description,
            groupqty,
            ticket_type,
            name,
            quantity,
            startdate,
            starttime,
            datetimeid,
            scanstartdate,
            scanstarttime,
            scan_min_datetime,
            scan_min_time,
            event_min_datetime,
            price,
            cutprice,
            isselling,
            issoldout,
            tickethide
        } = req.body;
        const tax = 0;
        let ticket_price = parseFloat(price) || 0;
        let ticket_cutprice = parseFloat(cutprice) || 0;
        let tax_amount = 0;
        if (tax > 0) {
            tax_amount = (price * tax) / 100;
            tax_amount = Math.round(tax_amount);
        }
        const total_amount = ticket_price + tax_amount;
        const newItem = {
            ticket_type,
            name,
            id: generateUUID(),
            quantity,
            isselling,
            issoldout,
            tickethide,
            isdelete: 0,
            groupqty,
            description,
            startdate,
            starttime,
            datetimeid,
            scanstartdate,
            scanstarttime,
            scan_min_datetime,
            scan_min_time,
            event_min_datetime,
            price: ticket_type == 1 ? total_amount : '',
            cut_price: ticket_cutprice,
            ticket_amount: ticket_type == 1 ? total_amount : ''
        };
        const updateQuery = {
            $push: {
                allprice: newItem
            }
        };

        const result = await Event.updateOne({ _id: updateid }, updateQuery);

        if (ticket_type == '2') {
            const Updatedata = {
                isfreeticket: 1
            };
            await Event.updateOne({ _id: updateid }, Updatedata);
        }
        if (result.modifiedCount === 1) {
            res.status(201).json({
                success: true,
                data: 'Updated'
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
// events dates
router.post("/get/event-dates", async (req, res, next) => {
    try {
        const {
            eupid,
        } = req.body;
        const result = await Event.findOne({ _id: eupid });
        if (result) {
            // Filter the event_dates to only include those where isdelete is 0
            const filteredEventDates = result && result.event_dates ? result.event_dates.filter(date => date.is_delete === 0) : [];

            if (filteredEventDates.length > 0) {
                res.status(200).json({
                    success: true,
                    data: filteredEventDates
                });
            } else {
                return next(new ErrorHandler("No events date found", 200));
            }
        } else {
            return next(new ErrorHandler("No event found", 404));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/create/event-dates", async (req, res, next) => {
    try {
        const {
            startdate,
            startmindate,
            starttime,
            startmintime,
            upid,
            eupid,
        } = req.body;
        if (upid) {
            let updatedFields = {
                "event_dates.$.date": startdate,
                "event_dates.$.mindate": startmindate,
                "event_dates.$.time": starttime,
                "event_dates.$.mintime": startmintime,
                "event_dates.$.is_delete": 0,
            };
            const result = await Event.updateOne(
                { _id: eupid, "event_dates.id": upid },
                { $set: updatedFields },
                { arrayFilters: [{ "event_dates.id": upid }] }
            );

            const queryCondition = {
                _id: eupid,
                "allprice.datetimeid": upid
            };
            const updateQuery = {
                $set: {
                    "allprice.$.startdate": startdate,
                    "allprice.$.starttime": starttime,
                }
            };
            const update_Ticket_result = await Event.updateMany(queryCondition, updateQuery);
            if (result.modifiedCount === 1) {
                res.status(201).json({
                    success: true
                });
            } else {
                res.status(404).json({
                    success: false
                });
            }
        } else {
            const newItem = {
                id: generateUUID(),
                date: startdate,
                mindate: startmindate,
                time: starttime,
                mintime: startmintime,
                is_delete: 0,
            };
            const updateQuery = {
                $push: {
                    event_dates: newItem
                }
            };
            const result = await Event.updateOne({ _id: eupid }, updateQuery);
            if (result.modifiedCount === 1) {
                res.status(201).json({
                    success: true
                });
            } else {
                res.status(404).json({
                    success: false
                });
            }
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/delete/event-dates", async (req, res, next) => {
    try {
        const {
            eventid,
            id
        } = req.body;
        let updatedFields = {
            "event_dates.$.is_delete": 1,
        };
        const result = await Event.updateOne(
            { _id: eventid, "event_dates.id": id },
            { $set: updatedFields },
            { arrayFilters: [{ "event_dates.id": id }] }
        );

        const update_Ticket_result = await Event.updateMany(
            { _id: eventid, "allprice.datetimeid": id },
            { $set: { "allprice.$.isdelete": 1 } }
        );
        if (result.modifiedCount === 1) {
            res.status(200).json({
                success: true,
                data: update_Ticket_result
            });
        } else {
            res.status(404).json({
                success: false
            });
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

router.post("/update-ticket-sellingfast", async (req, res, next) => {
    try {
        const {
            updateid,
            ticketid,
            status
        } = req.body;
        let updatedFields = {
            "allprice.$.isselling": status,
        };
        const result = await Event.updateOne(
            { _id: updateid, "allprice.id": ticketid },
            { $set: updatedFields },
            { arrayFilters: [{ "allprice.id": ticketid }] }
        );
        if (result.modifiedCount === 1) {
            res.status(200).json({
                success: true,
                message: 'Updated'
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Try Again"
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/update-ticket-soldout", async (req, res, next) => {
    try {
        const {
            updateid,
            ticketid,
            status
        } = req.body;
        let updatedFields = {
            "allprice.$.issoldout": status,
        };

        const result = await Event.updateOne(
            { _id: updateid, "allprice.id": ticketid },
            { $set: updatedFields },
            { arrayFilters: [{ "allprice.id": ticketid }] }
        );
        if (result.modifiedCount === 1) {
            res.status(200).json({
                success: true,
                message: 'Updated'
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Try Again"
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/update-ticket-hide", async (req, res, next) => {
    try {
        const {
            updateid,
            ticketid,
            status
        } = req.body;
        let updatedFields = {
            "allprice.$.tickethide": status,
        };

        const result = await Event.updateOne(
            { _id: updateid, "allprice.id": ticketid },
            { $set: updatedFields },
            { arrayFilters: [{ "allprice.id": ticketid }] }
        );
        if (result.modifiedCount === 1) {
            res.status(200).json({
                success: true,
                message: 'Updated'
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Try Again"
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/edit/event-ticket", async (req, res, next) => {
    try {
        const {
            updateid,
            ticketeditid,
            description,
            groupqty,
            ticket_type,
            name,
            quantity,
            startdate,
            starttime,
            datetimeid,
            scanstartdate,
            scanstarttime,
            scan_min_datetime,
            scan_min_time,
            event_min_datetime,
            price,
            cutprice,
            isselling,
            issoldout,
            tickethide
        } = req.body;

        const tax = 0; // Assuming tax is always 0 as per your code snippet.
        let ticket_price = parseFloat(price) || 0;
        let ticket_cutprice = parseFloat(cutprice) || 0;
        let tax_amount = 0; // Since tax is 0, tax_amount will also be 0.

        const total_amount = ticket_price;

        // Prepare the updated fields for the ticket.
        let updatedFields = {
            "allprice.$.ticket_type": ticket_type,
            "allprice.$.name": name,
            "allprice.$.quantity": quantity,
            "allprice.$.isselling": isselling,
            "allprice.$.issoldout": issoldout,
            "allprice.$.tickethide": tickethide,
            "allprice.$.isdelete": 0,
            "allprice.$.groupqty": groupqty,
            "allprice.$.description": description,
            "allprice.$.startdate": startdate,
            "allprice.$.starttime": starttime,
            "allprice.$.datetimeid": datetimeid,
            "allprice.$.scanstartdate": scanstartdate,
            "allprice.$.scanstarttime": scanstarttime,
            "allprice.$.scan_min_datetime": scan_min_datetime,
            "allprice.$.scan_min_time": scan_min_time,
            "allprice.$.event_min_datetime": event_min_datetime,
            "allprice.$.price": ticket_type == 1 ? total_amount : '',
            "allprice.$.cut_price": ticket_cutprice,
            "allprice.$.ticket_amount": ticket_type == 1 ? total_amount : ''
        };

        // Update the matching ticket in the allprice array.
        const result = await Event.updateOne(
            { _id: updateid, "allprice.id": ticketeditid },
            { $set: updatedFields },
            { arrayFilters: [{ "allprice.id": ticketeditid }] }
        );

        // Additional logic to mark the event as having a free ticket if ticket_type is '2'.
        if (ticket_type == '2') {
            await Event.updateOne(
                { _id: updateid },
                { $set: { isfreeticket: 1 } }
            );
        }

        if (result.modifiedCount === 1) {
            res.status(201).json({
                success: true,
                data: 'Updated'
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
router.post("/update/eventtickettype", async (req, res, next) => {
    try {
        const { editid, id } = req.body;
        const list = await Event.updateOne({ _id: editid }, { event_subtype_id: id });
        res.status(200).json({
            success: true,
            data: list,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/remove/price", async (req, res, next) => {
    try {
        const { updateid, ticketid } = req.body;
        const check = await Seatmap.countDocuments({ ticketid: ticketid, isdelete: 0 });
        if (check > 0) {
            return next(new ErrorHandler("Delete seatmap for this ticket first !", 400));
        }
        // Construct an update query to set the isdelete field for the matching item
        const updateQuery = {
            $set: {
                "allprice.$.isdelete": 1 // This sets the isdelete flag to true
            }
        };

        // Find the document with _id equal to updateid and the item with id equal to ticketid within allprice array
        const queryCondition = {
            _id: updateid,
            "allprice.id": ticketid // This condition ensures we target the correct item in the array
        };

        const result = await Event.updateOne(queryCondition, updateQuery);

        if (result.modifiedCount === 1) {
            res.status(200).json({
                success: true,
                data: 'Item marked as deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                data: 'Item not found or update failed'
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/organizer/ticket-sold", async (req, res, next) => {
    try {
        const { id } = req.body;
        const list = await Orderitem.find({ organizer_id: id, isvalid: 0 }).sort({ _id: -1 }).exec();
        res.status(200).json({
            success: true,
            data: list,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/organizer/ticket-list", async (req, res, next) => {
    try {
        const { id } = req.body;
        const list = await Event.find({ organizer_id: id }).sort({ _id: -1 }).exec();
        res.status(200).json({
            success: true,
            data: list,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/update-status", async (req, res, next) => {
    try {
        const { id, isstatus, organizerid, is_admin } = req.body;
        let UpdateEvent = [];
        const getEvent = await Event.findOne({ _id: id });
        if (getEvent && isstatus == 1) {
            if (!getEvent.banner_image) {
                return next(new ErrorHandler('Add event banner images', 400));
            }
            if (!getEvent.thum_image) {
                return next(new ErrorHandler('Add event thumbnail images', 400));
            }
            if (!getEvent.event_desc) {
                return next(new ErrorHandler('Add event description first', 400));
            }
            if (getEvent.allprice && getEvent.allprice.some(ticket => ticket.isdelete === 0)) {

            } else {
                return next(new ErrorHandler('Add ticket first', 400));
            }
        }
        if (is_admin && is_admin == 1) {
            UpdateEvent = await Event.updateOne({ _id: id }, { admin_publish: isstatus });
        } else {
            UpdateEvent = await Event.updateOne({ _id: id, organizer_id: organizerid }, { visibility: isstatus });
        }
        if (UpdateEvent.modifiedCount === 1) {
            res.status(200).json({
                success: true,
                message: "Update Success",
            });
        } else {
            return next(new ErrorHandler('Update failed', 400));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/list", async (req, res, next) => {
    try {
        const { id, countryname } = req.body;
        let matchCondition = {};
        if (id) {
            matchCondition.organizer_id = id;
        }
        matchCondition.isdelete = 0;
        if (countryname) {
            matchCondition.countryname = countryname;
        }

        const eventList = await Event.aggregate([
            {
                $match: matchCondition
            },
            {
                $addFields: {
                    convertedOrderId: { $toString: "$_id" }
                }
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
router.post("/tickets-booking-list", async (req, res, next) => {
    try {
        const {
            eventid, name
        } = req.body;
        const list = await Orderitem.find({ eventid: eventid, ticket_name: name, isvalid: 0 });
        res.status(200).json({
            success: true,
            data: list,
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/view-event-details", async (req, res, next) => {
    try {
        const {
            id
        } = req.body;
        const list = await Event.findOne({ _id: id });
        const OrganizerData = await Organizer.findOne({ _id: list.organizer_id });
        const OrderPurchesHistory = await Ordersevent.find({ event_id: id, status: 1 })
            .select('quantity ticket_name ticket_id');
        res.status(200).json({
            success: true,
            data: list,
            organizer: OrganizerData,
            orderqtylist: OrderPurchesHistory,
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/get-details", async (req, res, next) => {
    try {
        const {
            id
        } = req.body;
        const list = await Event.findOne({ _id: id });

        if (list) {
            const OrganizerData = await Organizer.findOne({ _id: list.organizer_id });
            const Ticketbooklist = await Orderitem.find({ eventid: id, isvalid: 0 });
            res.status(200).json({
                success: true,
                data: list,
                bookinglist: Ticketbooklist,
                organizer: OrganizerData
            });
        } else {
            return next(new ErrorHandler("Event not found", 400));
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/ticket-list", async (req, res, next) => {
    try {
        const {
            updateid
        } = req.body;
        const projection = {
            allprice: 1
        };
        const list = await Event.findOne({ _id: updateid }, projection);
        const Ticketsoldlist = await Ordersevent.find({ event_id: updateid, status: 1 });
        res.status(200).json({
            success: true,
            data: list,
            ticketdata: Ticketsoldlist
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/event-data-count", async (req, res, next) => {
    try {
        const todaymindate = Mindate;

        const OfflineEventpending = await Event.countDocuments({
            end_mindate: { $gt: todaymindate },
            status: 0,
            isdelete: 0,
            eventtype: 2
        });

        // Count where mindate is less than todaymindate and isactive is 0
        const OfflineEventcomplete = await Event.countDocuments({
            end_mindate: { $lt: todaymindate },
            status: 0,
            isdelete: 0,
            eventtype: 2
        });
        const OnlineEventpending = await Event.countDocuments({
            end_mindate: { $gt: todaymindate },
            status: 0,
            isdelete: 0,
            eventtype: 1
        });

        // Count where mindate is less than todaymindate and isactive is 0
        const OnlineEventcomplete = await Event.countDocuments({
            end_mindate: { $lt: todaymindate },
            status: 0,
            isdelete: 0,
            eventtype: 1
        });
        res.status(200).json({
            success: true,
            data: {
                OfflineEventpending: OfflineEventpending,
                OfflineEventcomplete: OfflineEventcomplete,
                OnlineEventpending: OnlineEventpending,
                OnlineEventcomplete: OnlineEventcomplete,
            }

        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/upcoming-events", async (req, res, next) => {
    try {
        const { organizerid } = req.body;
        const limit = 5;
        const eventFields = Object.keys(Event.schema.paths);

        const projection = {
            _id: 1,
            orderCount: { $size: '$activeOrderItems' },
        };

        eventFields.forEach(field => {
            projection[field] = 1;
        });

        const listWithCountOrder = await Event.aggregate([
            {
                $match: { organizer_id: organizerid }
            },
            {
                $lookup: {
                    from: 'Orderitem',
                    localField: '_id',
                    foreignField: 'eventid',
                    as: 'orderitem'
                }
            },
            {
                $lookup: {
                    from: 'Orderitem',
                    let: { eventId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$eventid', '$$eventId'] },
                                        { $eq: ['$isactive', 0] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'activeOrderItems'
                }
            },
            {
                $project: projection
            },
            {
                $sort: { mindate: -1 }
            },
            {
                $limit: limit
            }
        ]);
        res.status(200).json({
            success: true,
            data: listWithCountOrder
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/customer-analytics-data", async (req, res, next) => {
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
        const totalTicketbuy = await Orderitem.countDocuments({ owner_id: userid, isdelete: 0 });
        const totalPendingTicket = await Orderitem.countDocuments({ owner_id: userid, isdelete: 0, scan_status: 0 });
        const result = await Orderitem.aggregate([
            {
                $match: {
                    owner_id: userid
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" }
                }
            }
        ]);
        const orderAmount = result.length > 0 ? result[0].totalAmount : 0;
        res.status(200).json({
            success: true,
            totalticketbuy: totalTicketbuy,
            orderamount: orderAmount,
            totalpendingticket: totalPendingTicket
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/analytics-data", async (req, res, next) => {
    try {
        const { organizerid } = req.body;
        const getdateCreate = new Date();
        const ThisYear = moment(getdateCreate).format('YYYY');
        const totalEvent = await Event.countDocuments({ organizer_id: organizerid, isdelete: 0 });
        const Ticketsold = await Orderitem.countDocuments({ organizer_id: organizerid, isvalid: 0 });
        const totalRevenue = await Ordersevent.aggregate([
            {
                $match: {
                    organizer_id: organizerid,
                    ticket_price: { $ne: null },
                    status: "1"
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: { $multiply: ["$ticket_price", "$quantity"] } }
                }
            }
        ]);
        console.log(totalRevenue);
        const revenue = totalRevenue.length > 0 ? totalRevenue[0].totalRevenue : 0;

        const revenueData = await Orderitem.find({
            organizer_id: organizerid,
            isvalid: 0,
        });

        const itemCountByMonth = Array(12).fill(0);

        revenueData.forEach(item => {
            const [day, month, year] = item.date.split("-");
            if (year === ThisYear) {
                itemCountByMonth[parseInt(month) - 1]++;
            }
        });

        const totalRevenueByMonth = await Ordersevent.aggregate([
            {
                $match: {
                    organizer_id: organizerid,
                    ticket_price: { $ne: null },
                    status: "1",
                    date: { $regex: new RegExp(`-${ThisYear}$`) }  // Match dates ending with "-2024"
                }
            },
            {
                $addFields: {
                    month: { $substr: ["$date", 3, 2] } // Extract the month from the date string
                }
            },
            {
                $group: {
                    _id: "$month",
                    totalRevenue: { $sum: { $multiply: ["$ticket_price", "$quantity"] } }
                }
            },
            {
                $sort: { "_id": 1 }
            }
        ]);

        const revenueByMonth = Array(12).fill(0);
        totalRevenueByMonth.forEach(item => {
            const monthIndex = parseInt(item._id) - 1;
            revenueByMonth[monthIndex] = item.totalRevenue;
        });

        res.status(200).json({
            success: true,
            totalevents: totalEvent,
            totalincome: revenue,
            totalticketsold: Ticketsold,
            graphTicketsold: itemCountByMonth,
            revenuebymonth: revenueByMonth,
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/get-payout-request-list", async (req, res, next) => {
    try {
        const { organizerid } = req.body;
        const list = await Eventpayout.find({ organizer_id: organizerid, status: { $lt: 2 } });

        res.status(200).json({
            success: true,
            data: list,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/send-payout-request", async (req, res, next) => {
    try {
        const { id, organizerid } = req.body;
        const checkBank = await Organizer.findOne({ _id: organizerid });
        if (!checkBank.bankaccount || !checkBank.bankname || !checkBank.holdername || !checkBank.swiftcode) {
            return next(new ErrorHandler("Complete your bank details under profile", 400));
        }
        const check = await Eventpayout.findOne({ organizer_id: organizerid, event_id: id });
        if (check && check.status == 0) {
            return next(new ErrorHandler("Payout is pending", 400));
        }
        if (check && check.status == 1) {
            return next(new ErrorHandler("Payout is completed", 400));
        }
        await Eventpayout.create({
            organizer_id: organizerid,
            organizer_country: checkBank.countryname,
            event_id: id,
            date: DateValue,
            mindate: Mindate,
            status: 0
        });
        res.status(200).json({
            success: true,
            data: 1,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/eventmail-sender", async (req, res, next) => {
    try {
        const {
            orgid,
            eventid,
        } = req.body;
        // userid: orgid || "1"
        const emaillist = await Mailbox.find({ is_schedule: false, is_event_mail: true, send_status: false });
        // const eventData = eventid == "s" ? await Event.findOne({ _id: eventid ? eventid : null }) : null;
        // const event_image_url = eventData ? eventData.thum_image : null;
        // const event_url = eventData ? `https://tixme.co/tixme_ui/event/${eventData._id}/${eventData.display_name}` : '';
        for (const item of emaillist) {
            const eventData = item.event_id && item.event_id != "text" ? await Event.findOne({ _id: item.event_id ? item.event_id : null }) : null;
            const event_image_url = eventData ? eventData.thum_image : null;
            const event_url = eventData ? `https://tixme.co/event/${eventData._id}/${eventData.display_name}` : '';

            const emailTemplate = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                      .email-container {
                        width: 100%;
                        max-width: 600px;
                        margin: 0 auto;
                        border-radius: 5px;
                        border: 1px solid #ddd;
                        overflow: hidden;
                        font-family: Arial, sans-serif;
                      }
                    
                      .email-header img {
                        width: 100%;
                        height: auto;
                      }
                    
                      .email-body {
                        padding: 20px;
                        text-align: center;
                      }
                    
                      .email-title {
                        font-size: 24px;
                        margin-bottom: 10px;
                      }
                    
                      .email-location,
                      .email-date {
                        font-size: 18px;
                        margin-bottom: 15px;
                      }
                    
                      .email-button {
                        display: inline-block;
                        background-color: #007bff;
                        color: #ffffff !important;
                        padding: 10px 20px;
                        border-radius: 5px;
                        text-decoration: none;
                        font-size: 18px;
                      }
                    
                      .email-footer {
                        background-color: #f8f9fa;
                        text-align: center;
                        padding: 10px 20px;
                        font-size: 14px;
                      }
                    
                      .email-additional-content {
                        padding: 20px;
                        text-align: left;
                        font-size: 16px;
                        text-align: center;
                      }
                      img{
                        height: 100%;
                      }
                    </style>
                    </head>
                    <body>
                    <div style="text-align:center;margin-bottom:30px">
                    <img alt="Tixme" height="34" src="${'https://tixme.co/tixme_storage/storage/app/public/applogo/tixmeoriginlogo.png'}" style="border-width: 0px; width: 160px; height: auto;" width="160">
                    </div>
                      <div class="email-container">
                        ${eventData && event_image_url ? (
                    `<div class="email-header">
                                    <img src="${event_image_url}" height="34" width="150" alt="Header Image">
                                    </div>`
                ) : ''}
                        ${eventData ? (`<div class="email-body">
                          <h2 class="email-title">${eventData.display_name}</h2>
                          <p class="email-location">${eventData.displayaddress || eventData.location}</p>
                          <p class="email-date">Date: ${eventData.start_date} | Time: ${eventData.start_time}</p>
                          <a href="${event_url}" class="email-button">Learn More</a>
                        </div> `) : ''}
                          <div class="email-additional-content">
                        ${item.message && (`<p>${item.message || ''}</p>`)}
                      </div>
                        <div class="email-footer" style="paddign-top:30px">
                        <table width="600" cellpadding="0" cellspacing="0"><tr><td valign="top">
                        <tr>
                        <td align="center" style="padding-bottom:0;padding-right:0;padding-left:0;padding-top:0px;" valign="middle"><span class="sg-image" data-imagelibrary="%7B%22width%22%3A%228%22%2C%22height%22%3A18%2C%22alt_text%22%3A%22Facebook%22%2C%22alignment%22%3A%22%22%2C%22border%22%3A0%2C%22src%22%3A%22https%3A//marketing-image-production.s3.amazonaws.com/uploads/0a1d076f825eb13bd17a878618a1f749835853a3a3cce49111ac7f18255f10173ecf06d2b5bd711d6207fbade2a3779328e63e26a3bfea5fe07bf7355823567d.png%22%2C%22link%22%3A%22%23%22%2C%22classes%22%3A%7B%22sg-image%22%3A1%7D%7D"><a href="https://www.facebook.com/profile.php?id=61556603844279" target="_blank"><img alt="Facebook" height="18" src="${Imgurl + 'social/facebook.png'}" style="border-width: 0px; margin-right: 21px; margin-left: 21px; width: 20px; height: auto;" width="8"></a></span>
                          <!--[if gte mso 9]>&nbsp;&nbsp;&nbsp;<![endif]--><span class="sg-image" data-imagelibrary="%7B%22width%22%3A%2223%22%2C%22height%22%3A18%2C%22alt_text%22%3A%22Twitter%22%2C%22alignment%22%3A%22%22%2C%22border%22%3A0%2C%22src%22%3A%22https%3A//marketing-image-production.s3.amazonaws.com/uploads/6234335b200b187dda8644356bbf58d946eefadae92852cca49fea227cf169f44902dbf1698326466ef192bf122aa943d61bc5b092d06e6a940add1368d7fb71.png%22%2C%22link%22%3A%22%23%22%2C%22classes%22%3A%7B%22sg-image%22%3A1%7D%7D"><a href="https://www.instagram.com/tixme.co" target="_blank"><img alt="Twitter" height="18" src="${Imgurl + 'social/instagram.png'}" style="border-width: 0px; margin-right: 16px; margin-left: 16px; width: 20px; height: auto;" width="23"></a></span>
                          <!--[if gte mso 9]>&nbsp;&nbsp;&nbsp;&nbsp;<![endif]--><span class="sg-image" data-imagelibrary="%7B%22width%22%3A%2218%22%2C%22height%22%3A18%2C%22alt_text%22%3A%22Instagram%22%2C%22alignment%22%3A%22%22%2C%22border%22%3A0%2C%22src%22%3A%22https%3A//marketing-image-production.s3.amazonaws.com/uploads/650ae3aa9987d91a188878413209c1d8d9b15d7d78854f0c65af44cab64e6c847fd576f673ebef2b04e5a321dc4fed51160661f72724f1b8df8d20baff80c46a.png%22%2C%22link%22%3A%22%23%22%2C%22classes%22%3A%7B%22sg-image%22%3A1%7D%7D"><a href="https://www.linkedin.com/company/tixme-co" target="_blank"><img alt="Instagram" height="18" src="${Imgurl + 'social/linkedin.png'}" style="border-width: 0px; margin-right: 16px; margin-left: 16px; width: 20px; height: auto;" width="18"></a></span></td>
                      </tr>
                      <!-- whitespace -->
                      <tr>
                        <td height="25">
                          <p style="line-height: 25px; padding: 0 0 0 0; margin: 0 0 0 0;">&nbsp;</p>
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
                    </tbody>
                  </table>
                        </div>
                      </div>
                    
                    </body>
                    </html>
                    
`;
            const Y = await sendMail({
                email: item.rec_mailid,
                subject: eventData ? "Event Reminder" : 'Tixme',
                message: emailTemplate,
                isHtml: true, // Set this to true to indicate that the message is in HTML format
            });
            await Mailbox.updateOne({ _id: item._id }, { send_status: true });
            console.log("ds");
        }

        res.status(201).json({
            success: true,
            message: "Successfull",
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/organizer-followers-list", async (req, res, next) => {
    try {
        const { id } = req.body;
        const FollwersCustomerList = await Followlog.find({ organizerid: id });
        res.status(200).json({
            success: true,
            data: FollwersCustomerList,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/organizer-eventmail-send", async (req, res, next) => {
    try {
        const {
            orgid,
            usertype,
            eventid,
            userlist = [], // Default to an empty array if not provided
            message,
            myfollwers,
            myfollwerslist = []
        } = req.body;

        if (!myfollwerslist && userlist.length === 0) { // Check if userlist is empty
            return res.status(400).json({
                success: false,
                data: "No user selected",
            });
        }

        const orderInsetid = new Date();
        const formattedDate = moment(orderInsetid).format('DD-MM-YYYY');
        const formattedTime = moment(orderInsetid).format('hh:mm A');
        const minTimeFormat = moment(orderInsetid).format('YYYYDDMM');
        const customermailId = userlist ? userlist.map(organizer => organizer.value) : [];
        const followerList = myfollwerslist.map(organizer => organizer.value);
        let MembershipCustomer = [...customermailId, ...followerList]; // Copy userlist

        if (myfollwers) {
            const FollwersCustomerList = await Followlog.find({ organizerid: orgid });
            const FollowerEmails = FollwersCustomerList.map(follower => follower.useremail);
            MembershipCustomer = [...MembershipCustomer, ...FollowerEmails];
        }

        MembershipCustomer = [...new Set(MembershipCustomer)]; // Remove duplicates

        const inserItems = MembershipCustomer.map(item => ({
            userid: orgid,
            usertype: usertype,
            rec_mailid: item, // Ensure this is the correct property for the email address
            send_status: false,
            date: formattedDate,
            time: formattedTime,
            is_event_mail: true,
            event_id: eventid ? eventid : "text",
            is_schedule: false,
            mindate: minTimeFormat,
            message: message,
        }));

        const createMailList = await Mailbox.insertMany(inserItems);

        if (createMailList) {
            return res.status(201).json({
                success: true,
                message: "Successfully sent.",
            });
        } else {
            return res.status(400).json({
                success: false,
                data: "Server error. Try again or contact support.",
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

router.post("/admin-eventmail-send", async (req, res, next) => {
    try {
        const {
            membershipid = [],
            organizersid = [],
            newsletter = [],
            message,
            usertype,
            eventid
        } = req.body;

        const orderInsetid = new Date();
        const formattedDate = moment(orderInsetid).format('DD-MM-YYYY');
        const formattedTime = moment(orderInsetid).format('hh:mm A');
        const minTimeFormat = moment(orderInsetid).format('YYYYDDMM');

        let MembershipCustomer = [];

        if (membershipid) {
            const MemberCustomerList = await Customer.find({ planid: { $in: membershipid } });
            MembershipCustomer = MemberCustomerList.map(customer => customer.email);
        }
        if (organizersid) {
            const organizerIds = organizersid.map(organizer => organizer.value);
            if (organizerIds.length > 0) {
                const FollwersCustomerList = await Followlog.find({ organizerid: { $in: organizerIds } });
                const FollowerEmails = FollwersCustomerList.map(follower => follower.useremail);

                // Combine the MembershipCustomer and FollowerEmails arrays
                MembershipCustomer = [...MembershipCustomer, ...FollowerEmails];
            }
        }
        if (newsletter) {
            const newsletterList = newsletter.map(organizer => organizer.value);
            MembershipCustomer = [...MembershipCustomer, ...newsletterList];
        }
        MembershipCustomer = [...new Set(MembershipCustomer)];
        const inserItems = MembershipCustomer.flatMap((item, index) => ({
            userid: 1,
            usertype: usertype,
            rec_mailid: item,
            send_status: false,
            date: formattedDate,
            time: formattedTime,
            is_event_mail: true,
            event_id: eventid,
            is_schedule: false,
            mindate: minTimeFormat,
            message: message,
        }));
        const createMailList = await Mailbox.insertMany(inserItems);
        if (createMailList) {
            res.status(201).json({
                success: true,
                message: "Successfull",
            });
        } else {
            res.status(400).json({
                success: false,
                data: "Server error try again or contact TIXME",
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/get-customerlist-for-mail", async (req, res, next) => {
    try {
        const { orgid, tickettype } = req.body;
        const ticketIds = tickettype && tickettype.map(ticket => ticket.value);
        const GetCustomer = await Ordersevent.find({ ticket_id: { $in: ticketIds }, status: "1", organizer_id: orgid }).select('customer_id customer_email');
        res.status(200).json({
            success: true,
            data: GetCustomer,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/get-all-customerlist-for-mail", async (req, res, next) => {
    try {
        const { orgid } = req.body;
        const GetCustomer = await Ordersevent.find({ status: 1, organizer_id: orgid }).select('customer_id customer_email');
        res.status(200).json({
            success: true,
            data: GetCustomer,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/event-delete", async (req, res, next) => {
    try {
        const { upid, orgid } = req.body;
        // const checkcustomer = await Order.countDocuments({ eventid: upid, tnsid: { $ne: null } });
        // if (checkcustomer > 0) {
        //     return next(new ErrorHandler("User already bought this event's tickets you can't delete", 400));
        // }
        const insertData = {
            isdelete: 1
        };
        await Event.updateOne({ _id: upid, organizer_id: orgid }, { $set: insertData });
        res.status(201).json({
            success: true,
            message: "Deleted Successfully"
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/getseatmap", async (req, res, next) => {
    try {
        const { id } = req.body;
        const data = await Seatmap.find({ isdelete: 0, eventid: id });
        const EventsData = await Event.findOne({ _id: id }); // Use findOne to get a single document
        const EventTickets = EventsData.allprice; // No need to use index [0]

        // Add ticket details to each item in data
        const updatedData = data.map(item => {
            const ticketDetails = EventTickets.find(ticket => ticket.id === item.ticketid);
            return {
                ...item._doc, // Spread the original item
                ticketdetails: ticketDetails // Add the ticket details
            };
        });
        const Seatlog = await seatmaplog.find({ eventid: id, status: true });
        res.status(201).json({
            success: true,
            data: updatedData,
            Seatlog: Seatlog
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

router.post("/seatmap-create", async (req, res, next) => {
    try {
        const {
            id,
            seatdata,
            pageheight,
            pageweight,
            organizerid,
            seatmapimage
        } = req.body;

        await Seatmap.updateMany({ eventid: id }, { isdelete: 1 });
        const SeatMapData = seatdata.flatMap((item, index) => ({
            organizerid: organizerid,
            eventid: id,
            isdelete: 0,
            sectionname: item.name,
            sectionId: item.sectionId,
            rows: item.rows,
            seatsPerRow: item.seatsPerRow,
            ticketid: item.ticketPrice,
            position: item.position,
            seatColor: item.seatColor,
            rotationAngle: item.rotationAngle
        }));

        const Insert = await Seatmap.insertMany(SeatMapData);
        const updateData = { pageheight, pageweight };

        if (seatmapimage) {
            updateData.seatmapimage = seatmapimage;
        }
        const Update = await Event.updateOne({ _id: id }, updateData);

        res.status(201).json({
            success: true,
            message: "Succes"
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});


module.exports = router;
// /create
// /update
// /update/eventdesc
// /upload-image
// create/event-ticket
// /get/event-dates
// /create/event-dates
// /delete/event-dates
// /update-ticket-sellingfast
// /update-ticket-soldout
// /edit/event-ticket
// /update/eventtickettype
// /remove/price
// /organizer/ticket-sold
// /organizer/ticket-lis
// /update-status
// /list
// /tickets-booking-list
// /view-event-details
// /get-details
// /ticket-list
// /event-data-count
// /upcoming-events
// /customer-analytics-data
// /analytics-data
// /get-payout-request-list
// /send-payout-request
// /get-customerlist-for-mail
// /organizer-followers-list
// /organizer-eventmail-send
// /datetimevalidation
// /eventmail-sender
// /seatmap-create
// /update-ticket-hide