const express = require("express");
const Eventtax = require("../model/eventtax");
const Event = require("../model/event");
const Order = require("../model/order");
const Seatmaplog = require("../model/seatmaplog");
const Orderitem = require("../model/orderitem");
const Tax = require("../model/tax");
const Organizer = require("../model/organizer");
const Customer = require("../model/customer");
const Ordersevent = require("../model/ordersevent");
const Couponredeemlog = require("../model/couponredeemlog");
const Payoutlog = require("../model/payoutlog");
const Packageplan = require("../model/packageplan");
const Packageplanlog = require("../model/packageplanlog");
const Walletupdatelog = require("../model/walletupdatelog");
const Tickettransfer = require("../model/tickettransferlog");
const TransferHistory = require("../model/transferhistory");
const sendMail = require("../utils/sendMail");
const router = express.Router();
const Support = require("../model/support");
const Contact = require("../model/contact");
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/ErrorHandler");
const moment = require('moment');
const {
    isScanDateTimeValid,
    Mindate,
    DateValue,
    TimeValue,
    OnlyYear,
    monthDatetoMIn,
    CouponCode,
    Imgurl,
    mailHeader
} = require("../utils/Helper");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const Razorpay = require('razorpay');
const { generateUUID } = require('../utils/Uuid');
const razorpay = new Razorpay({
    key_id: 'rzp_test_1z0OjtVnFjHbuT',
    key_secret: 'RaJmPhFLDBwVRLnUta5CV0s0',
});
router.post("/manual-status-update", async (req, res, next) => {
    const { orderid,type } = req.body;
    try {
		await Order.updateOne({ _id: orderid }, { $set: { payment_status: type } });
        await Ordersevent.updateOne({ orderid: orderid }, { $set: { status: type } });
        const OrderDataforpayment =  await Order.findOne({ _id: orderid });
        const  paymentid  = OrderDataforpayment.payment_id;
        if (!paymentid) {
            return res.status(401).json({
                success: false,
                data: "Payment id not found!",
            });
        }
        const getOrderData = await Order.findOne({ payment_id: paymentid });
        if (!getOrderData) {
            return res.status(401).json({
                success: false,
                data: "Payment id not found!",
            });
        }
        const gatwayName = getOrderData.gatway_name;
        var transactionId = '';
        if (gatwayName == "Stripe" || gatwayName == "rezorpay") {
            var transactionId = 'stripemanualupdate'+moment().unix();
        } else if (gatwayName == "hitpay") {
            var transactionId = 'hitpaymanualupdate'+moment().unix();
        } else if (gatwayName == "Free") {
            transactionId = CouponCode;
        }

        if (transactionId) {

            if (getOrderData.couponid != null) {
                await Couponredeemlog.updateOne({ _id: getOrderData.couponid }, { isvalid: 1 });
            }

            const updateData = {};
            updateData.payment_status = 1;
            updateData.tnsid = transactionId;
            const updateOrderTable = await Order.updateOne({ payment_id: paymentid }, updateData);

            if (updateOrderTable.modifiedCount === 1) {

                const OrderData = await Order.findOne({ payment_id: paymentid });
                await Seatmaplog.updateMany({ orderid: OrderData._id }, { status: true });
                const userid = OrderData.userid;
                const isRedeemPoint = OrderData.rewardpoints;
                const customerData = await Customer.findOne({ _id: userid });
                if (isRedeemPoint > 0 && OrderData.isredeemdone == 0) {
                    const OrderDataChek = await Order.findOne({ payment_id: paymentid });
                    const updateData = {};
                    updateData.isredeemdone = 1;
                    await Order.updateOne({ payment_id: paymentid }, updateData);
                    if (OrderDataChek.isredeemdone == 0) {
                        const user_wallet = parseInt(customerData.wallet);
                        const Total = user_wallet - parseInt(isRedeemPoint);
                        await Customer.updateOne({ _id: userid, }, { wallet: Total });

                        await Walletupdatelog.create({
                            userid: customerData._id,
                            useremail: customerData.email,
                            amount: isRedeemPoint,
                            userwallet: Total,
                            amounttype: "Debit",
                            date: DateValue,
                            mindate: Mindate,
                            time: TimeValue

                        });
                    }
                }
                if (isRedeemPoint == 0) {
                    if (customerData.planid) {
                        const getplanData = await Packageplan.findOne({ _id: customerData.planid });
                        const XorderData = await Order.findOne({ payment_id: paymentid });
                        if (getplanData) {
                            const checkCount = await Orderitem.countDocuments({ order_id: XorderData._id });

                            var userWallet = customerData.wallet ? parseInt(customerData.wallet, 10) : 0;
                            var Total = 0;

                            for (let i = 0; i < checkCount; i++) {
                                Total += userWallet + parseInt(getplanData.discount_amount, 10);
                            }

                            const finalAmount = Total; // Now finalAmount holds the total value after the loop


                            await Customer.updateOne({ _id: userid, }, { wallet: finalAmount });
                            await Walletupdatelog.create({
                                userid: customerData._id,
                                useremail: customerData.email,
                                amount: getplanData.discount_amount,
                                amounttype: "Credit",
                                userwallet: finalAmount,
                                date: DateValue,
                                mindate: Mindate,
                                time: TimeValue
                            });
                        } else {
                            const checkCount = await Orderitem.countDocuments({ order_id: XorderData._id });

                            var userWallet = customerData.wallet ? parseInt(customerData.wallet, 10) : 0;
                            var Total = 0;

                            for (let i = 0; i < checkCount; i++) {
                                Total += userWallet + parseInt(10);
                            }

                            const finalAmount = Total; // Now finalAmount holds the total value after the loop


                            await Customer.updateOne({ _id: userid, }, { wallet: finalAmount });
                            await Walletupdatelog.create({
                                userid: customerData._id,
                                useremail: customerData.email,
                                amount: 10,
                                amounttype: "Credit",
                                userwallet: finalAmount,
                                date: DateValue,
                                mindate: Mindate,
                                time: TimeValue
                            });
                        }
                    }
                }
                const updateData = {};
                updateData.isvalid = 0;
                const orderData = await Order.findOne({ payment_id: paymentid });
                await Orderitem.updateMany({ order_id: orderData._id }, updateData);
                await Ordersevent.updateMany({ orderid: orderData._id }, { status: 1 });
                const resData = {
                    name: orderData.name,
                    userid: orderData.userid,
                    email: orderData.email,
                    amount: orderData.amount,
                    tnsid: transactionId,
                    date: orderData.date,
                    time: orderData.time,
                    main_orderid: orderData._id
                }
                res.status(200).json({
                    success: true,
                    data: resData,
                });
            } else {
                res.status(401).json({
                    success: false,
                    data: "Update failed",
                });
            }
        } else {
            return res.status(401).json({
                success: false,
                data: "Transaction Id not found",
            });
        }


    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

router.post("/membership-check", async (req, res, next) => {
    try {
        const { customerId } = req.body;
        const year = OnlyYear;
        const orderData = await Order.find({ userid: customerId, year }).select('amount');
        const customerData = await Customer.findOne({ _id: customerId });
        const totalAmount = orderData.reduce((sum, order) => sum + parseInt(order.amount), 0);
        const packagePlanList = await Packageplan.find({ isdelete: 0 });
        let eligiblePackagePlan;
        for (const plan of packagePlanList) {
            const planAmount = parseInt(plan.purchase_amount);
            if (planAmount <= totalAmount && (!eligiblePackagePlan || planAmount > parseInt(eligiblePackagePlan.purchase_amount))) {
                eligiblePackagePlan = plan;
            }
        }
        if (eligiblePackagePlan) {
            const check = await Packageplanlog.findOne({ userid: customerId, year: year, planid: eligiblePackagePlan._id });
            if (!check) {
                const insert = await Packageplanlog.create({
                    userid: customerId,
                    username: customerData.name,
                    useremail: customerData.email,
                    planid: eligiblePackagePlan._id,
                    plan_name: eligiblePackagePlan.name,
                    plan_amount: eligiblePackagePlan.purchase_amount,
                    plan_discount: eligiblePackagePlan.discount_amount,
                    year: year,
                    mindate: Mindate,
                    date: DateValue
                })
                const update = await Customer.updateOne({ _id: customerId }, {
                    planid: eligiblePackagePlan._id,
                    plan_name: eligiblePackagePlan.name,
                    plan_amount: eligiblePackagePlan.purchase_amount,
                    plan_discount: eligiblePackagePlan.discount_amount,
                });
            }
        }
        res.status(200).json({
            success: true,
            data: eligiblePackagePlan,
        });
    } catch (error) {
        return next(error);
    }
});
router.post('/razorpay/checkout', async (req, res, next) => {
    // try {
    //     const { amount, currency, receipt, payment_capture } = req.body;

    //     // Create an order
    //     const order = await razorpay.orders.create({
    //         amount: 10 * 100, // Amount in paise
    //         currency: 'INR',
    //         receipt: receipt || 'order_receipt',
    //         payment_capture: payment_capture || 1,
    //     });

    //     // Extract payment URL from the order response
    //     const paymentUrl = order && order.short_url;

    //     // Send the payment URL as a response
    //     res.json({ paymentUrl });
    // } catch (error) {
    //     console.error('Razorpay checkout error:', error);
    //     res.status(500).send('Internal Server Error');
    // }
    try {
        const options = {
            amount: 1000, // Amount in paise
            currency: "INR",
            receipt: "receipt#1",
            payment_capture: '1'
        };

        const order = await razorpay.orders.create(options);
        res.json(order.id);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});
router.post("/hitpay/checkout", async (req, res, next) => {
    const hitPayApiUrl = 'https://api.hit-pay.com/v1/payment-requests';

    const requestData = {
        amount: 10,
        currency: "SGD",
        email: "amitmajumder559@gmail.com",
        expires_after: "30 mins",
        expiry_date: null,
        name: "Amit Majumder",
        payment_methods: null,
        purpose: "buytickets",
        redirect_url: "http://localhost:3000/tixme_ui/",
        reference_number: "12345679979",
    };

    try {
        const response = await axios.post(hitPayApiUrl, requestData, {
            headers: {
                'X-BUSINESS-API-KEY': 'cce92d335dda220bbd6a63a0de31b2c93e70ff31d9ab2ab9be4a41de19a30e03',
                'Content-Type': 'application/json'
            }
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post("/stripe/checkout", async (req, res, next) => {
    try {
        const { selectedSeats, eventid, cartitem, totalamount, gatway_name, location, rewardpoints, discountamount, couponid, carttotalamount } = req.body;
        const getevent = await Event.findOne({ _id: eventid});
        const geteventdata = getevent.allprice;
        const OrderPurchesHistory = await Ordersevent.find({ event_id: eventid, status: 1 }).select('quantity ticket_name ticket_id');
        
        const processedItems = cartitem.map((item, index) => {
            const totalQuantity = OrderPurchesHistory.filter((i) => i.ticket_id == item.id)
                .reduce((acc, item) => acc + item.quantity, 0);
            const totalavlQuantity = geteventdata.filter((i) => i.id == item.id)
                .reduce((acc, item) => acc + item.quantity, 0);

                const is_sold_out = geteventdata
                .filter((i) => i.id === item.id)
                .reduce((acc, item) => acc + item.issoldout, 0) > 0;
                if(is_sold_out == true){
                    return res.status(401).json({
                        success: false,
                        data: "Preferred Ticket Category Is No Longer Available. Please Select Another Ticket Category.",
                    }); 
                }
            const qty_avl = Number(item.quantity) + Number(totalQuantity);
            const finalqty =  Number(totalavlQuantity) - Number(qty_avl);
            if(finalqty >= 0 ){

            }else{
                return res.status(401).json({
                    success: false,
                    data: "Preferred Ticket Category Is No Longer Available. Please Select Another Ticket Category.",
                }); 
            }

        });


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
        const userData = await Customer.findOne({ _id: userid });
        if (!userData) {
             res.status(401).json({
                success: false,
                data: "User data not found",
            });
        }
        const id = userData._id;
        const name = userData.name;
        const email = userData.email;
        const items = cartitem;
        const amount = totalamount;
        const mindate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const date = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');
        const time = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        const payment_status = 0;
        const currency = "inr";
        const isdelete = 0;
        const insertData = await Order.create({
            userid,
            eventid,
            year: OnlyYear,
            gatway_name,
            rewardpoints: rewardpoints ? rewardpoints : 0,
            isredeemdone: rewardpoints ? 0 : 1,
            location,
            discountamount: discountamount,
            couponid: couponid,
            name,
            email,
            items,
            amount,
            carttotalamount,
            mindate,
            date,
            time,
            payment_status,
            currency,
            isdelete
        });
        const orderInsetid = insertData.id;
        if (orderInsetid) {
            const orderEventItem = cartitem.flatMap((item, index) => ({
                orderid: orderInsetid,
                customer_id: id,
                customer_name: name,
                customer_email: userData.email,
                ticket_name: item.name,
                ticket_id: item.id,
                ticket_price: item.price,
                ticket_group_qty: item.groupqty ? item.groupqty : 1,
                organizer_id: item.event.organizer_id,
                event_id: item.eventId,
                bookingid: generateUUID(),
                status: 0,
                date: DateValue,
                time: TimeValue,
                mindate: Mindate,
                currency: item.event.countrysymbol,
                currency_name: item.event.currencycode,
                order_amount: totalamount,
                quantity: item.quantity,
                start_date: item.startdate,
                start_date_min: monthDatetoMIn(item.startdate),
                start_time: item.starttime,
            }));

            const createdOrderEvents = await Ordersevent.insertMany(orderEventItem);

            const orderItems = cartitem.flatMap((item, index) => {
                const repeatedItems = Array.from({ length: item.quantity * item.groupqty }, (_, i) => ({
                    order_id: orderInsetid,
                    eventid: item.eventId,
                    ticket_name: item.name,
                    ticket_id: item.id,
                    ticket_price: item.price,
                    ticket_type: item.ticket_type,
                    user_email: email,
                    user_name: name,
                    owner_id: id,
                    owner_name: name,
                    owner_email: email,
                    scan_status: 0,
                    isvalid: 1,
                    mindate: Mindate,
                    date: DateValue,
                    time: TimeValue,
                    organizer_id: item.event.organizer_id,
                    bookingid: generateUUID(),
                    eventdata: {
                        id: item.event._id,
                        eventtype: item.event.eventtype,
                        display_name: item.event.display_name,
                        category_name: item.event.category_name,
                        start_date: item.event.start_date,
                        start_time: item.event.start_time,
                        end_date: item.event.end_date,
                        organizer_id: item.event.organizer_id,
                        location: item.event.location,
                        mindate: item.event.mindate,
                        isseatmap: item.event.seatmap,
                    },
                }));
                return repeatedItems;
            });

            const createdOrderItems = await Orderitem.insertMany(orderItems);

            if (selectedSeats) {
                const seatmapLogs = selectedSeats.map(seatIdentifier => {
                    const [boxindex, seatindex, boxid] = seatIdentifier.split('-');
                    return {
                        orderid: orderInsetid,
                        boxindex,
                        status: false,
                        eventid: eventid,
                        boxid: boxid,
                        seatindex: parseInt(seatindex)
                    };
                });

                await Seatmaplog.insertMany(seatmapLogs);
            }

            if (!createdOrderItems) {
                res.status(401).json({
                    success: false,
                    data: "Ticket item not inserted!",
                });
            }

            const totalPrice = totalamount;
            var ccc = '';
            if (gatway_name == "Stripe") {
                var ccc = 'USD';
            } else {
                var ccc = 'INR';
            }
            if (totalPrice > 0) {
                if (gatway_name == "Stripe" || gatway_name == "rezorpay") {
                    // Create a checkout session
                    const session = await stripe.checkout.sessions.create({
                        "payment_method_types": [
                            "card",
                        ],
                        line_items: [
                            {
                                price_data: {
                                    currency: ccc,
                                    product_data: {
                                        name: "Tixme",
                                    },
                                    unit_amount: totalPrice * 100, // Stripe uses the amount in cents
                                },
                                quantity: 1,
                            },
                        ],
                        mode: "payment",
                        success_url: process.env.SUCCESS_URL || "http://localhost:3000/tixme_ui/order-successful-page",
                        cancel_url: process.env.CANCEL_URL || "http://localhost:3000/tixme_ui/order-failed-page",
                    });
                    if (session.url && session.id) {
                        const updateData = {};
                        updateData.payment_id = session.id;
                        updateData.gatway_res = session;
                        const payment_id_insert = await Order.updateOne({ _id: orderInsetid }, updateData);
                        await Ordersevent.updateMany({ orderid: orderInsetid }, { payment_id: session.id });
                        if (payment_id_insert.modifiedCount === 1) {
                            res.status(200).json({
                                success: true,
                                url: session.url,
                                payment_id: session.id,
                            });
                        } else {
                            res.status(404).json({
                                success: false,
                                data: 'Payment id insert update failed'
                            });
                        }
                    } else {
                        res.status(401).json({
                            success: false,
                            data: "stripe payment gatway failed!",
                        });
                    }
                } else if (gatway_name == "hitpay") {
                    const hitPayApiUrl = 'https://api.hit-pay.com/v1/payment-requests';

                    const requestData = {
                        amount: totalPrice,
                        currency: "SGD",
                        email: userData.email,
                        expires_after: "30 mins",
                        expiry_date: null,
                        name: userData.name,
                        payment_methods: null,
                        purpose: "buytickets",
                        redirect_url: process.env.SUCCESS_URL || "http://localhost:3000/tixme_ui/order-successful-page",
                        reference_number: orderInsetid,
                    };

                    try {
                        const response = await axios.post(hitPayApiUrl, requestData, {
                            headers: {
                                'X-BUSINESS-API-KEY': 'cce92d335dda220bbd6a63a0de31b2c93e70ff31d9ab2ab9be4a41de19a30e03',
                                'Content-Type': 'application/json'
                            }
                        });
                        // res.status(response.status).json(response.data);
                        // console.log(response.status);
                        if (response && response.status === 201) {
                            const { id, url } = response.data;
                            const updateData = {};
                            updateData.payment_id = id;
                            updateData.gatway_res = response.data;
                            const payment_id_insert = await Order.updateOne({ _id: orderInsetid }, updateData);
                            if (payment_id_insert.modifiedCount === 1) {
                                res.status(200).json({
                                    success: true,
                                    url: url,
                                    payment_id: id,
                                    paymentorderid : orderInsetid
                                });
                            } else {
                                res.status(404).json({
                                    success: false,
                                    data: 'Payment id insert update failed'
                                });
                            }
                            // Send success response with payment details
                        } else {
                            // Send error response
                            res.status(500).json({
                                success: false,
                                error: 'Payment request failed',
                            });
                        }
                    } catch (error) {
                        res.status(500).json({ error: 'Internal Server Error' });
                    }
                } else if (gatway_name == "xxx") {
                    const hitPayApiUrl = 'https://api.hit-pay.com/v1/payment-requests';

                    const requestData = {
                        amount: totalPrice,
                        currency: "SGD",
                        email: userData.email,
                        expires_after: "30 mins",
                        expiry_date: null,
                        name: userData.name,
                        payment_methods: null,
                        purpose: "buytickets",
                        redirect_url: process.env.SUCCESS_URL || "http://localhost:3000/tixme_ui/order-successful-page",
                        reference_number: orderInsetid,
                    };

                    try {
                        const response = await axios.post(hitPayApiUrl, requestData, {
                            headers: {
                                'X-BUSINESS-API-KEY': 'cce92d335dda220bbd6a63a0de31b2c93e70ff31d9ab2ab9be4a41de19a30e03',
                                'Content-Type': 'application/json'
                            }
                        });
                        // res.status(response.status).json(response.data);
                        // console.log(response.status);
                        if (response && response.status === 201) {
                            const { id, url } = response.data;
                            const updateData = {};
                            updateData.payment_id = id;
                            updateData.gatway_res = response.data;
                            const payment_id_insert = await Order.updateOne({ _id: orderInsetid }, updateData);
                            if (payment_id_insert.modifiedCount === 1) {
                                res.status(200).json({
                                    success: true,
                                    url: url,
                                    payment_id: id,
                                });
                            } else {
                                res.status(404).json({
                                    success: false,
                                    data: 'Payment id insert update failed'
                                });
                            }
                            // Send success response with payment details
                        } else {
                            // Send error response
                            res.status(500).json({
                                success: false,
                                error: 'Payment request failed',
                            });
                        }
                    } catch (error) {
                        res.status(500).json({ error: 'Internal Server Error' });
                    }
                }
            } else {
                const Bookingid = generateUUID();
                const updateData = {};
                updateData.payment_id = Bookingid;
                await Order.updateOne({ _id: orderInsetid }, updateData);
                res.status(200).json({
                    success: true,
                    payment_id: Bookingid,
                    payment_type: "Free",
                });
            }

        } else {
            res.status(401).json({
                success: false,
                data: "Order insert failed!",
            });
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.get("/checkstatus", async (req, res, next) => {
    const { paymentid='9cb1d39e-b4f2-47b7-b8cb-0912166d1801'} = req.body;
 
    try {
        const refId = paymentid;
        const hitPayStatusApiUrl = 'https://api.hit-pay.com/v1/payment-requests';
        const response = await axios.get(`${hitPayStatusApiUrl}/${refId}`, {
            headers: {
                'X-BUSINESS-API-KEY': 'cce92d335dda220bbd6a63a0de31b2c93e70ff31d9ab2ab9be4a41de19a30e03',
                'Content-Type': 'application/json'
            }
        });
        if (response && response.status === 200) {
            return res.status(response.status).json({
                success:  true,
                data: response.data.status
            });
        } else {
            return res.status(response.status).json({
                success: false,
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
})
router.post("/stripe/success-check", async (req, res, next) => {
    try {
        const { paymentid } = req.body;
        if (!paymentid) {
            return res.status(401).json({
                success: false,
                data: "Payment id not found!",
            });
        }
        const getOrderData = await Order.findOne({ payment_id: paymentid });
        if (!getOrderData) {
            return res.status(401).json({
                success: false,
                data: "Payment id not found!",
            });
        }
        const gatwayName = getOrderData.gatway_name;
        var transactionId = '';
        if (gatwayName == "Stripe" || gatwayName == "rezorpay") {
            const session = await stripe.checkout.sessions.retrieve(paymentid);
            if (session.payment_status === "paid") {
                const paymentIntentId = session.payment_intent;
                const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
                transactionId = paymentIntent.payment_method;
            } else {
                await Ordersevent.updateMany({ orderid: getOrderData._id }, { status: 2 });
                return res.status(401).json({
                    success: false,
                    data: "Payment could not be processed, please try again!",
                });
            }
        } else if (gatwayName == "hitpay") {
            try {
                const refId = paymentid;
                const hitPayStatusApiUrl = 'https://api.hit-pay.com/v1/payment-requests';
                const response = await axios.get(`${hitPayStatusApiUrl}/${refId}`, {
                    headers: {
                        'X-BUSINESS-API-KEY': 'cce92d335dda220bbd6a63a0de31b2c93e70ff31d9ab2ab9be4a41de19a30e03',
                        'Content-Type': 'application/json'
                    }
                });
                if (response && response.status === 200) {
                    if (response.data.status === 'completed') {
                        transactionId = response.data.id;
                    } else {
                        await Ordersevent.updateMany({ orderid: getOrderData._id }, { status: 2 });
                        return res.status(401).json({
                            success: false,
                            data: "Payment could not be processed, please try again!",
                        });
                    }
                } else {
                    return res.status(response.status).json({
                        success: false,
                        error: 'Failed to retrieve payment status'
                    });
                }
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        } else if (gatwayName == "Free") {
            transactionId = CouponCode;
        }

        if (transactionId) {

            if (getOrderData.couponid != null) {
                await Couponredeemlog.updateOne({ _id: getOrderData.couponid }, { isvalid: 1 });
            }

            const updateData = {};
            updateData.payment_status = 1;
            updateData.tnsid = transactionId;
            const updateOrderTable = await Order.updateOne({ payment_id: paymentid }, updateData);

            if (updateOrderTable.modifiedCount === 1) {

                const OrderData = await Order.findOne({ payment_id: paymentid });
                await Seatmaplog.updateMany({ orderid: OrderData._id }, { status: true });
                const userid = OrderData.userid;
                const isRedeemPoint = OrderData.rewardpoints;
                const customerData = await Customer.findOne({ _id: userid });
                if (isRedeemPoint > 0 && OrderData.isredeemdone == 0) {
                    const OrderDataChek = await Order.findOne({ payment_id: paymentid });
                    const updateData = {};
                    updateData.isredeemdone = 1;
                    await Order.updateOne({ payment_id: paymentid }, updateData);
                    if (OrderDataChek.isredeemdone == 0) {
                        const user_wallet = parseInt(customerData.wallet);
                        const Total = user_wallet - parseInt(isRedeemPoint);
                        await Customer.updateOne({ _id: userid, }, { wallet: Total });

                        await Walletupdatelog.create({
                            userid: customerData._id,
                            useremail: customerData.email,
                            amount: isRedeemPoint,
                            userwallet: Total,
                            amounttype: "Debit",
                            date: DateValue,
                            mindate: Mindate,
                            time: TimeValue

                        });
                    }
                }
                if (isRedeemPoint == 0) {
                    if (customerData.planid) {
                        const getplanData = await Packageplan.findOne({ _id: customerData.planid });
                        const XorderData = await Order.findOne({ payment_id: paymentid });
                        if (getplanData) {
                            const checkCount = await Orderitem.countDocuments({ order_id: XorderData._id });

                            var userWallet = customerData.wallet ? parseInt(customerData.wallet, 10) : 0;
                            var Total = 0;

                            for (let i = 0; i < checkCount; i++) {
                                Total += userWallet + parseInt(getplanData.discount_amount, 10);
                            }

                            const finalAmount = Total; // Now finalAmount holds the total value after the loop


                            await Customer.updateOne({ _id: userid, }, { wallet: finalAmount });
                            await Walletupdatelog.create({
                                userid: customerData._id,
                                useremail: customerData.email,
                                amount: getplanData.discount_amount,
                                amounttype: "Credit",
                                userwallet: finalAmount,
                                date: DateValue,
                                mindate: Mindate,
                                time: TimeValue
                            });
                        } else {
                            const checkCount = await Orderitem.countDocuments({ order_id: XorderData._id });

                            var userWallet = customerData.wallet ? parseInt(customerData.wallet, 10) : 0;
                            var Total = 0;

                            for (let i = 0; i < checkCount; i++) {
                                Total += userWallet + parseInt(10);
                            }

                            const finalAmount = Total; // Now finalAmount holds the total value after the loop


                            await Customer.updateOne({ _id: userid, }, { wallet: finalAmount });
                            await Walletupdatelog.create({
                                userid: customerData._id,
                                useremail: customerData.email,
                                amount: 10,
                                amounttype: "Credit",
                                userwallet: finalAmount,
                                date: DateValue,
                                mindate: Mindate,
                                time: TimeValue
                            });
                        }
                    }
                }
                const updateData = {};
                updateData.isvalid = 0;
                const orderData = await Order.findOne({ payment_id: paymentid });
                await Orderitem.updateMany({ order_id: orderData._id }, updateData);
                await Ordersevent.updateMany({ orderid: orderData._id }, { status: 1 });
                const resData = {
                    name: orderData.name,
                    userid: orderData.userid,
                    email: orderData.email,
                    amount: orderData.amount,
                    tnsid: transactionId,
                    date: orderData.date,
                    time: orderData.time,
                    main_orderid: orderData._id
                }
                res.status(200).json({
                    success: true,
                    data: resData,
                });
            } else {
                res.status(401).json({
                    success: false,
                    data: "Update failed",
                });
            }
        } else {
            return res.status(401).json({
                success: false,
                data: "Transaction Id not found",
            });
        }


    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/order-confirmation-mail", async (req, res, next) => {
    try {
        const { id, transferemail } = req.body;
        const orderItemdata = await Orderitem.findOne({ order_id: id });
        const orderData = await Order.findOne({ _id: id });
        if (orderItemdata) {
            const eventData = await Event.findOne({ _id: orderItemdata.eventid });
            const username = orderItemdata.user_name;
            const useremail = transferemail ? transferemail : orderItemdata.user_email;
            const event_name = eventData.name;
            const event_address = eventData.fulladdress || eventData.location;
            const event_date = eventData.start_date;
            const event_time = eventData.start_time;
            const event_price = orderData.amount;
            const event_currency = eventData.countrysymbol;
            const qrcodeurl = transferemail ? 'https://tixme.co/transferticket/' + orderData._id : 'https://tixme.co/viewtickets/' + orderData._id;
            const event_image_url = eventData.thum_image;
            const check = await Order.findOne({ _id: id });
            const emailTemplate = `
                   <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
<center>
    <table cellpadding="0" cellspacing="0" border="0" width="480">
              <tbody><tr> 
                <td width="480" align="center" style="min-width:480px">
                  <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                    <tbody><tr>
                      <td>
                        <table cellpadding="0" cellspacing="0" width="100%" style="min-width:100%"><tbody><tr><td>
<table bgcolor="#009CDE" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tbody><tr>
            <td align="left" style="font-family:Arial,Helvetica,sans-serif;font-size:0px;line-height:0px;color:rgb(0,156,222)">${username}, your tickets are ready!</td>
        </tr>
        <tr style="background:#fff">
            <td align="center" valign="top" style="padding:30px 20px 20px">
            <table align="center" cellpadding="0" cellspacing="0" border="0">
                    <tbody><tr>
                        <td align="cetner" >
                        <img src="${'https://tixme.co/tixme_storage/storage/app/public/applogo/tixmeoriginlogo.png'}"   width="160" height="auto" border="0" style="display:block" alt="Ticketmaster" class="CToWUd" data-bit="iit">
                        </td>
                    </tr>
            </tbody></table>
            </td>
        </tr>
</tbody></table>
</td></tr></tbody></table>
                      </td>
                    </tr>
                    <tr>
                      <td height="1" style="max-height:1px;line-height:1px;font-size:1px">
                        <img src="https://ci3.googleusercontent.com/meips/ADKq_NYgfY3HK5Yfy7CP0sHHQ09WVcQTC7q9XeX9lo15VFeQDneAag_kl0KFXZpPzwnhB36jpJdS7QU_rJNES36ybeDFvHgi50a7ximHAbjpVjnrnSz4PdG4DqoAoeY-btZg7maWaUZDZeM4XGNeAOX6_wVoNCD8poTBM2hCqIMvDs8_utZIs3REq20ibuaWu3RSffX_wDAMd2ZonQNNSqxqlUcHgu7T15b47zxvjY564I3W0jh6eT-UHSni5ZsGfJhc_LZl1OjHFuDH=s0-d-e1-ft#https://click.email.ticketmaster.com/open.aspx?ffcb10-fec11173706d017e-fe1f11797c6005787c1575-fe8c137277660c7470-ff9c1671-fe2712777d6d027d751672-fe9215717c6401797c&amp;d=70188&amp;bmt=0" width="1" height="1" alt="" class="CToWUd" data-bit="iit">

<img src="https://ci3.googleusercontent.com/meips/ADKq_NZJRPnoPfqOJ4PuAsefSWaVS2NZJmwQxAjcZXE-xcfAGGM7OXT02Cn4_puA6c1oi7fbSmwxxvGa8IVJlTStsOXb1ZN38aeufFwuhdorI_BeDA6D93US7cfxYRw5lX593axEL9mIAooUPf7rQsBcGGI-lUhkOp8BmvOpfmqw6C6NzJaBA3hd7eA4xmaJZ4Kg_zgA4UV3hTnhdmqAcALi47BHQJXsE7BubaG8Wdr9C40vVClWq_Cv5rPE2vXWZJJKgTkUGzKL4flsSQpSzCT1k5ygd6gaLRtwpgYBotNPvdREo65GnU_s6TRdOXytrjbeERwhgkg8CwdTsg2Rr7Pj6aR688koZ_nh3tN05BlHkbXGRUTInGsMP6Yey62em7SFBySL3EIso2vHDuZ7LXvkyF-TiUOnrBRLHE9UBMcmz5lA7Dq2YjIaFKzgS7w12SBMHwkjJ-_LoBnj5hreFLheA_Od8Lhl-dzoEAEKvbSVo-w-8dYwkVJAkReGbEotRd42mILtL-6-CVv9fKsDHN1sRWraa3rhoxL34hX1S-rK1DdYrtcF7_XEDSXJQ6bp3-PsWnT8ZtsRPyQsNUlfE6QKSR5yCOGAL3k7T2PgUpb7ACXlR-Y4ub6CXhmWE-Q9YoZiYLndxdHHX42geIUs_OL-wBcTJRc6WAKi7hek3faQmfd-kBeuGs80Mr0SHEIQkLp4FWidDpe7PLIZtVnm_LjCD7LjmwmsPi06paEVUNW4HDfWmLvOdEyocQnKk85BZRshArY=s0-d-e1-ft#http://tmntr.ticketmaster.com/DUJIYr1WQzuIoLrckrmU7QLlM3eXdhmP57PIUPTr3uVXosBQPc/eJH/oCWT8BIKgOZR6WVc+kcrei0JBauUJlEKFDG+W71qSo16Re2sMqoWpDFNEk0uyuPp27hw5uWEYs9YP+qg8bED6s3KzjjgZFq0cTdP4bZmzniyqzuKzeSoapeoBzgQevJFD45rjAET87b83rHOduF7uiE5JFF6ciJ2M2+Lblbh3pF713d0QVtyeGBGeviwnoIZFy5FXBsH6sBqmqwCUyt0WS3PiqE3L7mFuH8EmX2t4xQXQBgTjlLkwZ4lIY+8GOBvrdA3qfgbg/V8WtGjkGcua3ykIiojlGPi3QamJzKHdCT8lVh2sjmUXCeX7eoQ9hu7k3KmOedaUHHjg+zROhgsdv7r8Pkwknjq2xbf1XP0FfMWx7SBLRM9sIZDY5H7Fs3v1dpFLLJFwLkNH+MpgN0OotlhK+BAQhb/R4rV8maUa9K6yvfZxaAj7rOlv+vvJSKATuJBgobdc2udRVvGimf8=" width="1" height="1" alt="" class="CToWUd" data-bit="iit">
                      </td>
                    </tr>                    
                    <tr>
                      <td>
                        <table width="100%" cellspacing="0" cellpadding="0" border="0">
    <tbody><tr>
        <td align="center" valign="top" style="font-family:Arial,Helvetica,&quot;sans serif&quot;;font-size:23px;line-height:32.2px;font-weight:bold;padding:25px 20px;color:rgb(71,80,88)">
               ${username}, your tickets are ready!
        </td>
    </tr>
 
</tbody></table> 
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
  <tbody><tr>
    <td align="center" style="padding:0px 30px">
      <table width="100%" cellspacing="0" cellpadding="0" border="0">
        <tbody><tr>
          <td align="center" valign="top">
            <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" valign="top">
              <tbody><tr>
                <td align="center">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tbody><tr>
                      <td align="left" style="border:1px solid rgb(223,228,231)">
                        <table width="100%" cellspacing="0" cellpadding="0" border="0">
                          <tbody><tr>
                            <td align="left" style="border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:rgb(223,228,231)">
                              <table bgcolor="#f7f8f9" width="100%" cellspacing="0" cellpadding="0" border="0">
                                
                                <tbody><tr>
                                  <td align="left" style="font-family:Arial,Helvetica,&quot;sans serif&quot;;font-size:16px;line-height:18px;font-weight:bold;padding:20px 0px 5px 16px;color:rgb(53,60,66)">
                                  ${event_name && event_name}
                                  </td>
                                </tr>
                                <tr>
                                  <td align="left" style="font-family:Arial,Helvetica,&quot;sans serif&quot;;font-size:14px;line-height:18px;padding-top:10px;padding-left:16px;color:rgb(105,116,124)">
                                   Date: ${event_date && event_date} | Time: ${event_time && event_time}
                                  </td>
                                </tr>
                                <tr>
                                  <td align="left" style="font-family:Arial,Helvetica,&quot;sans serif&quot;;font-size:14px;line-height:18px;padding:3px 0px 20px 16px;color:rgb(105,116,124)">
                                  ${event_address && eventData.location}
                                  </td>
                                </tr>
                                <tr>
                                  <td align="left">
                                    <table width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top-width:1px;border-top-style:solid;padding:15px;border-top-color:rgb(223,228,231)">
                                      <tbody><tr>
                                        <td align="left" valign="top" style="font-family:Arial,Helvetica,&quot;sans serif&quot;;font-size:14px;line-height:18px;font-weight:bold;color:rgb(53,60,66)">
                                        ${event_currency && event_currency}  ${event_price && event_price}
                                        </td>
                                      </tr>
                                    </tbody></table>
                                  </td>
                                </tr>
                              </tbody></table>
                            </td>
                          </tr>
                            ${event_image_url ? (
                          `<tr>
                            <td align="center" width="100%">
                              <img border="0" src="${event_image_url}" width="418" style="display:block;width:100%">
                            </td>
                          </tr>`
                            ) : ''}
                          <tr>
                            <td align="center" style="padding:20px 20px 0px">
                              <table cellspacing="0" width="100%" cellpadding="0" border="0" bgcolor="#009cde">
                                <tbody><tr>
                                  <td align="center" style="font-family:Arial,Helvetica,&quot;sans serif&quot;;font-weight:bold;font-size:12px;line-height:16px;padding:10px 0px;color:rgb(255,255,255)">
                                    <a style="color:#fff" href="${qrcodeurl}" target="_blank">VIEW TICKETS</a>
                                  </td>
                                </tr>
                              </tbody></table>
                            </td>
                          </tr>
                          <tr>
                            <td align="center" valign="top" style="font-family:Arial,Helvetica,&quot;sans serif&quot;;font-size:11px;line-height:14px;padding:20px 10px;color:rgb(71,80,88)">
                              This email is <b style="font-family:Arial,Helvetica,&quot;sans serif&quot;">NOT</b> your ticket.
                            </td>
                          </tr>
                        </tbody></table>
                      </td>
                    </tr>
                  </tbody></table>
                </td>
              </tr>
            </tbody></table>
          </td>
        </tr>
        <tr>
          <td align="left">
            <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0" style="padding-top:20px">
              <tbody><tr>
                <td align="center">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    
                      <tbody>
                    
                      <tr>
                        <td align="left" style="font-family:Arial,Helvetica,&quot;sans serif&quot;;font-size:14px;line-height:19.6px;font-weight:bold;padding:15px 0px 5px;color:rgb(53,60,66)">What’s Next?</td>
                      </tr>
                      <tr>
                        <td align="left" style="font-family:Arial,Helvetica,&quot;sans serif&quot;;font-size:14px;line-height:19.6px;padding:0px 0px 30.2px;color:rgb(53,60,66)">
                          Don’t forget to have your ticket(s) handy before you head out. To view and access your ticket order, click View Tickets above - or visit <a href="https://tixme.co/customer/dashboard" style="text-decoration:none;font-family:Arial,Helvetica,&quot;sans serif&quot;;color:rgb(0,156,222)" target="_blank" >My Account</a> if you are a member.
                        </td>
                      </tr>
                    
                  </tbody></table>
                </td>
              </tr>
            </tbody></table>
          </td>
        </tr>
      </tbody></table>
    </td>
  </tr>
</tbody></table>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <table width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f7f8f9">
        <tbody><tr>
            <td align="center" style="padding:35px 0px">
                <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tbody><tr>
                        <td align="center" valign="top" style="font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;line-height:20px;text-align:center;color:rgb(75,84,91)">
                            Want to know who else is going?
                        </td>
                    </tr>
                    <tr>
                        <td align="center" valign="top" style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:20px;text-align:center;padding:5px 5px 0px;color:rgb(75,84,91)">
                            Share with your friends and plan to meet-up.
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding:10px 0px 0px">
                            <table cellspacing="0" cellpadding="0" border="0">
                                <tbody><tr>
                                    <td align="left">
                                        <a href="https://www.facebook.com/profile.php?id=61556603844279" style="text-decoration:none;color:rgb(17,162,224)" target="_blank" >
                                            <img border="0" src="${Imgurl + 'social/facebook.png'}" width="32" height="32" style="display:block" class="CToWUd" data-bit="iit">
                                        </a>
                                    </td>
                                    <td align="left" style="padding-left:20px">
                                        <a href="https://www.instagram.com/tixme.co/" style="text-decoration:none;color:rgb(17,162,224)" target="_blank">
                                            <img border="0" src="${Imgurl + 'social/instagram.png'}" width="32" height="32" style="display:block" class="CToWUd" data-bit="iit">
                                        </a>
                                    </td>
                                    <td align="left" style="padding-left:20px">
                                        <a href="https://www.linkedin.com/company/tixme-co/" style="text-decoration:none;color:rgb(17,162,224)" target="_blank">
                                            <img border="0" src="${Imgurl + 'social/linkedin.png'}" width="32" height="32" style="display:block" class="CToWUd" data-bit="iit">
                                        </a>
                                    </td>
                                </tr>
                            </tbody></table>
                        </td>
                    </tr>
                </tbody></table>
            </td>
        </tr>
</tbody></table><table cellpadding="0" cellspacing="0" width="100%" style="min-width:100%"><tbody><tr><td><table border="0" cellpadding="0" cellspacing="0" bgcolor="#009CDE" width="100%">
  <tbody><tr>
   <td align="center">
    <table border="0" cellpadding="0" cellspacing="0" width="480">
     
      <tbody><tr>
       <td align="center" style="max-width:480px" width="480">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
         
          <tbody><tr>
           <td align="left" style="padding:30px 20px">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tbody><tr>
               <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;font-weight:normal;padding:2px 0px 0px;color:rgb(255,255,255)" valign="top">
                <a href="#m_4461797200112429732_m_8759493040611655396_" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;font-weight:normal;padding:2px 0px 0px;text-decoration:none;color:rgb(255,255,255)">TIXME <br> 10 Jalan Besar, #17-02, Sim Lim Tower, Singapore 208787</a><br>
                <br>
                © 2023 TIXME. All rights reserved.</td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table><table cellpadding="0" cellspacing="0" width="100%" style="min-width:100%"><tbody><tr><td>
</td></tr></tbody></table>
                      </td>
                    </tr></center>`;
                   
            if (!check.ismail) {
                await sendMail({
                    email: useremail,
                    subject: transferemail ? "Transfer Ticket" : "Ticket Confirmation",
                    message: emailTemplate,
                    isHtml: true, // Set this to true to indicate that the message is in HTML format
                });
                await sendMail({
                    email: 'tixme.sg@gmail.com',
                    subject: transferemail ? "Transfer Ticket" : "Ticket Confirmation",
                    message: emailTemplate,
                    isHtml: true, // Set this to true to indicate that the message is in HTML format
                });
            }
            await Order.updateOne({ _id: id }, { ismail: true });
            res.status(200).json({
                success: true
            });
        } else {
            return next(new ErrorHandler("No data found", 400));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.get("/hitpaystatuscheck", async (req, res, next) => {
    try {
    const orders = await Order.find({payment_status:'1'});
    const mindateactive = 20240905;
    for (const getOrderData of orders) {
        const serverdate = parseInt(getOrderData.mindate, 10);
        if(!getOrderData.ismail && serverdate > mindateactive){
            var transactionId = '';
            const refId = getOrderData.payment_id;
            const paymentid = getOrderData.payment_id;
            const hitPayStatusApiUrl = 'https://api.hit-pay.com/v1/payment-requests';
            const response = await axios.get(`${hitPayStatusApiUrl}/${refId}`, {
                headers: {
                    'X-BUSINESS-API-KEY': 'cce92d335dda220bbd6a63a0de31b2c93e70ff31d9ab2ab9be4a41de19a30e03',
                    'Content-Type': 'application/json'
                }
            });
            if (response && response.status === 200) {
                if (response.data.status === 'completed') {
                    transactionId = response.data.id;
                } else {
                    await Ordersevent.updateMany({ orderid: getOrderData._id }, { status: 2 });
                }
            }
            if (transactionId) {
                if (getOrderData.couponid != null) {
                    await Couponredeemlog.updateOne({ _id: getOrderData.couponid }, { isvalid: 1 });
                }
    
                const updateData = {};
                updateData.payment_status = 1;
                updateData.tnsid = transactionId;
                const updateOrderTable = await Order.updateOne({ payment_id: paymentid }, updateData);
    
                if (updateOrderTable.modifiedCount === 1) {
    
                    const OrderData = await Order.findOne({ payment_id: paymentid });
                    await Seatmaplog.updateMany({ orderid: OrderData._id }, { status: true });
                    const userid = OrderData.userid;
                    const isRedeemPoint = OrderData.rewardpoints;
                    const customerData = await Customer.findOne({ _id: userid });
                    if (isRedeemPoint > 0 && OrderData.isredeemdone == 0) {
                        const OrderDataChek = await Order.findOne({ payment_id: paymentid });
                        const updateData = {};
                        updateData.isredeemdone = 1;
                        await Order.updateOne({ payment_id: paymentid }, updateData);
                        if (OrderDataChek.isredeemdone == 0) {
                            const user_wallet = parseInt(customerData.wallet);
                            const Total = user_wallet - parseInt(isRedeemPoint);
                            await Customer.updateOne({ _id: userid, }, { wallet: Total });
    
                            await Walletupdatelog.create({
                                userid: customerData._id,
                                useremail: customerData.email,
                                amount: isRedeemPoint,
                                userwallet: Total,
                                amounttype: "Debit",
                                date: DateValue,
                                mindate: Mindate,
                                time: TimeValue
    
                            });
                        }
                    }
                    if (isRedeemPoint == 0) {
                        if (customerData.planid) {
                            const getplanData = await Packageplan.findOne({ _id: customerData.planid });
                            const XorderData = await Order.findOne({ payment_id: paymentid });
                            if (getplanData) {
                                const checkCount = await Orderitem.countDocuments({ order_id: XorderData._id });
    
                                var userWallet = customerData.wallet ? parseInt(customerData.wallet, 10) : 0;
                                var Total = 0;
    
                                for (let i = 0; i < checkCount; i++) {
                                    Total += userWallet + parseInt(getplanData.discount_amount, 10);
                                }
    
                                const finalAmount = Total; // Now finalAmount holds the total value after the loop
    
    
                                await Customer.updateOne({ _id: userid, }, { wallet: finalAmount });
                                await Walletupdatelog.create({
                                    userid: customerData._id,
                                    useremail: customerData.email,
                                    amount: getplanData.discount_amount,
                                    amounttype: "Credit",
                                    userwallet: finalAmount,
                                    date: DateValue,
                                    mindate: Mindate,
                                    time: TimeValue
                                });
                            } else {
                                const checkCount = await Orderitem.countDocuments({ order_id: XorderData._id });
    
                                var userWallet = customerData.wallet ? parseInt(customerData.wallet, 10) : 0;
                                var Total = 0;
    
                                for (let i = 0; i < checkCount; i++) {
                                    Total += userWallet + parseInt(10);
                                }
    
                                const finalAmount = Total; // Now finalAmount holds the total value after the loop
    
    
                                await Customer.updateOne({ _id: userid, }, { wallet: finalAmount });
                                await Walletupdatelog.create({
                                    userid: customerData._id,
                                    useremail: customerData.email,
                                    amount: 10,
                                    amounttype: "Credit",
                                    userwallet: finalAmount,
                                    date: DateValue,
                                    mindate: Mindate,
                                    time: TimeValue
                                });
                            }
                        }
                    }
                    const updateData = {};
                    updateData.isvalid = 0;
                    const orderData = await Order.findOne({ payment_id: paymentid });
                    await Orderitem.updateMany({ order_id: orderData._id }, updateData);
                    await Ordersevent.updateMany({ orderid: orderData._id }, { status: 1 });
                    const resData = {
                        name: orderData.name,
                        userid: orderData.userid,
                        email: orderData.email,
                        amount: orderData.amount,
                        tnsid: transactionId,
                        date: orderData.date,
                        time: orderData.time,
                        main_orderid: orderData._id
                    }
                }
            }
        }
    }} catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
})
router.get("/cronjobforpaymentsuccess", async (req, res, next) => {
    try {
        const transferemail = false;
        const orders = await Order.find({payment_status:1});
        const mindateactive = 20240905;
        for (const order of orders) {
            const serverdate = parseInt(order.mindate, 10); 
            if(!order.ismail && serverdate > mindateactive){
            const orderItemdata = await Orderitem.findOne({ order_id: order._id });
            const orderData = await Order.findOne({ _id: order._id });
            if (orderItemdata) {
                const eventData = await Event.findOne({ _id: orderItemdata.eventid });
                const username = orderItemdata.user_name;
                const useremail = transferemail ? transferemail : orderItemdata.user_email;
                const event_name = eventData?.name || '';
                const event_address = eventData?.fulladdress || eventData?.location || '';
                const event_date = eventData?.start_date || '';
                const event_time = eventData?.start_time || '';
                const event_price = orderData?.amount || '';
                const event_currency = eventData?.countrysymbol || '';
                const qrcodeurl = transferemail 
                    ? `https://tixme.co/transferticket/${orderData._id}`
                    : `https://tixme.co/viewtickets/${orderData._id}`;
                const event_image_url = eventData?.thum_image || '';

                // Proceed to construct email content
                const emailTemplate = `
                   <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
<center>
    <table cellpadding="0" cellspacing="0" border="0" width="480">
              <tbody><tr> 
                <td width="480" align="center" style="min-width:480px">
                  <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                    <tbody><tr>
                      <td>
                        <table cellpadding="0" cellspacing="0" width="100%" style="min-width:100%"><tbody><tr><td>
<table bgcolor="#009CDE" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tbody><tr>
            <td align="left" style="font-family:Arial,Helvetica,sans-serif;font-size:0px;line-height:0px;color:rgb(0,156,222)">${username}, your tickets are ready!</td>
        </tr>
        <tr style="background:#fff">
            <td align="center" valign="top" style="padding:30px 20px 20px">
            <table align="center" cellpadding="0" cellspacing="0" border="0">
                    <tbody><tr>
                        <td align="cetner" >
                        <img src="${'https://tixme.co/tixme_storage/storage/app/public/applogo/tixmeoriginlogo.png'}"   width="160" height="auto" border="0" style="display:block" alt="Ticketmaster" class="CToWUd" data-bit="iit">
                        </td>
                    </tr>
            </tbody></table>
            </td>
        </tr>
</tbody></table>
</td></tr></tbody></table>
                      </td>
                    </tr>
                    <tr>
                      <td height="1" style="max-height:1px;line-height:1px;font-size:1px">
                        <img src="https://ci3.googleusercontent.com/meips/ADKq_NYgfY3HK5Yfy7CP0sHHQ09WVcQTC7q9XeX9lo15VFeQDneAag_kl0KFXZpPzwnhB36jpJdS7QU_rJNES36ybeDFvHgi50a7ximHAbjpVjnrnSz4PdG4DqoAoeY-btZg7maWaUZDZeM4XGNeAOX6_wVoNCD8poTBM2hCqIMvDs8_utZIs3REq20ibuaWu3RSffX_wDAMd2ZonQNNSqxqlUcHgu7T15b47zxvjY564I3W0jh6eT-UHSni5ZsGfJhc_LZl1OjHFuDH=s0-d-e1-ft#https://click.email.ticketmaster.com/open.aspx?ffcb10-fec11173706d017e-fe1f11797c6005787c1575-fe8c137277660c7470-ff9c1671-fe2712777d6d027d751672-fe9215717c6401797c&amp;d=70188&amp;bmt=0" width="1" height="1" alt="" class="CToWUd" data-bit="iit">

<img src="https://ci3.googleusercontent.com/meips/ADKq_NZJRPnoPfqOJ4PuAsefSWaVS2NZJmwQxAjcZXE-xcfAGGM7OXT02Cn4_puA6c1oi7fbSmwxxvGa8IVJlTStsOXb1ZN38aeufFwuhdorI_BeDA6D93US7cfxYRw5lX593axEL9mIAooUPf7rQsBcGGI-lUhkOp8BmvOpfmqw6C6NzJaBA3hd7eA4xmaJZ4Kg_zgA4UV3hTnhdmqAcALi47BHQJXsE7BubaG8Wdr9C40vVClWq_Cv5rPE2vXWZJJKgTkUGzKL4flsSQpSzCT1k5ygd6gaLRtwpgYBotNPvdREo65GnU_s6TRdOXytrjbeERwhgkg8CwdTsg2Rr7Pj6aR688koZ_nh3tN05BlHkbXGRUTInGsMP6Yey62em7SFBySL3EIso2vHDuZ7LXvkyF-TiUOnrBRLHE9UBMcmz5lA7Dq2YjIaFKzgS7w12SBMHwkjJ-_LoBnj5hreFLheA_Od8Lhl-dzoEAEKvbSVo-w-8dYwkVJAkReGbEotRd42mILtL-6-CVv9fKsDHN1sRWraa3rhoxL34hX1S-rK1DdYrtcF7_XEDSXJQ6bp3-PsWnT8ZtsRPyQsNUlfE6QKSR5yCOGAL3k7T2PgUpb7ACXlR-Y4ub6CXhmWE-Q9YoZiYLndxdHHX42geIUs_OL-wBcTJRc6WAKi7hek3faQmfd-kBeuGs80Mr0SHEIQkLp4FWidDpe7PLIZtVnm_LjCD7LjmwmsPi06paEVUNW4HDfWmLvOdEyocQnKk85BZRshArY=s0-d-e1-ft#http://tmntr.ticketmaster.com/DUJIYr1WQzuIoLrckrmU7QLlM3eXdhmP57PIUPTr3uVXosBQPc/eJH/oCWT8BIKgOZR6WVc+kcrei0JBauUJlEKFDG+W71qSo16Re2sMqoWpDFNEk0uyuPp27hw5uWEYs9YP+qg8bED6s3KzjjgZFq0cTdP4bZmzniyqzuKzeSoapeoBzgQevJFD45rjAET87b83rHOduF7uiE5JFF6ciJ2M2+Lblbh3pF713d0QVtyeGBGeviwnoIZFy5FXBsH6sBqmqwCUyt0WS3PiqE3L7mFuH8EmX2t4xQXQBgTjlLkwZ4lIY+8GOBvrdA3qfgbg/V8WtGjkGcua3ykIiojlGPi3QamJzKHdCT8lVh2sjmUXCeX7eoQ9hu7k3KmOedaUHHjg+zROhgsdv7r8Pkwknjq2xbf1XP0FfMWx7SBLRM9sIZDY5H7Fs3v1dpFLLJFwLkNH+MpgN0OotlhK+BAQhb/R4rV8maUa9K6yvfZxaAj7rOlv+vvJSKATuJBgobdc2udRVvGimf8=" width="1" height="1" alt="" class="CToWUd" data-bit="iit">
                      </td>
                    </tr>                    
                    <tr>
                      <td>
                        <table width="100%" cellspacing="0" cellpadding="0" border="0">
    <tbody><tr>
        <td align="center" valign="top" style="font-family:Arial,Helvetica,&quot;sans serif&quot;;font-size:23px;line-height:32.2px;font-weight:bold;padding:25px 20px;color:rgb(71,80,88)">
               ${username}, your tickets are ready!
        </td>
    </tr>
 
</tbody></table> 
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
  <tbody><tr>
    <td align="center" style="padding:0px 30px">
      <table width="100%" cellspacing="0" cellpadding="0" border="0">
        <tbody><tr>
          <td align="center" valign="top">
            <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" valign="top">
              <tbody><tr>
                <td align="center">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tbody><tr>
                      <td align="left" style="border:1px solid rgb(223,228,231)">
                        <table width="100%" cellspacing="0" cellpadding="0" border="0">
                          <tbody><tr>
                            <td align="left" style="border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:rgb(223,228,231)">
                              <table bgcolor="#f7f8f9" width="100%" cellspacing="0" cellpadding="0" border="0">
                                
                                <tbody><tr>
                                  <td align="left" style="font-family:Arial,Helvetica,&quot;sans serif&quot;;font-size:16px;line-height:18px;font-weight:bold;padding:20px 0px 5px 16px;color:rgb(53,60,66)">
                                  ${event_name && event_name}
                                  </td>
                                </tr>
                                <tr>
                                  <td align="left" style="font-family:Arial,Helvetica,&quot;sans serif&quot;;font-size:14px;line-height:18px;padding-top:10px;padding-left:16px;color:rgb(105,116,124)">
                                   Date: ${event_date && event_date} | Time: ${event_time && event_time}
                                  </td>
                                </tr>
                                <tr>
                                  <td align="left" style="font-family:Arial,Helvetica,&quot;sans serif&quot;;font-size:14px;line-height:18px;padding:3px 0px 20px 16px;color:rgb(105,116,124)">
                                  ${event_address && eventData.location}
                                  </td>
                                </tr>
                                <tr>
                                  <td align="left">
                                    <table width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top-width:1px;border-top-style:solid;padding:15px;border-top-color:rgb(223,228,231)">
                                      <tbody><tr>
                                        <td align="left" valign="top" style="font-family:Arial,Helvetica,&quot;sans serif&quot;;font-size:14px;line-height:18px;font-weight:bold;color:rgb(53,60,66)">
                                        ${event_currency && event_currency}  ${event_price && event_price}
                                        </td>
                                      </tr>
                                    </tbody></table>
                                  </td>
                                </tr>
                              </tbody></table>
                            </td>
                          </tr>
                            ${event_image_url ? (
                          `<tr>
                            <td align="center" width="100%">
                              <img border="0" src="${event_image_url}" width="418" style="display:block;width:100%">
                            </td>
                          </tr>`
                            ) : ''}
                          <tr>
                            <td align="center" style="padding:20px 20px 0px">
                              <table cellspacing="0" width="100%" cellpadding="0" border="0" bgcolor="#009cde">
                                <tbody><tr>
                                  <td align="center" style="font-family:Arial,Helvetica,&quot;sans serif&quot;;font-weight:bold;font-size:12px;line-height:16px;padding:10px 0px;color:rgb(255,255,255)">
                                    <a style="color:#fff" href="${qrcodeurl}" target="_blank">VIEW TICKETS</a>
                                  </td>
                                </tr>
                              </tbody></table>
                            </td>
                          </tr>
                          <tr>
                            <td align="center" valign="top" style="font-family:Arial,Helvetica,&quot;sans serif&quot;;font-size:11px;line-height:14px;padding:20px 10px;color:rgb(71,80,88)">
                              This email is <b style="font-family:Arial,Helvetica,&quot;sans serif&quot;">NOT</b> your ticket.
                            </td>
                          </tr>
                        </tbody></table>
                      </td>
                    </tr>
                  </tbody></table>
                </td>
              </tr>
            </tbody></table>
          </td>
        </tr>
        <tr>
          <td align="left">
            <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0" style="padding-top:20px">
              <tbody><tr>
                <td align="center">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    
                      <tbody>
                    
                      <tr>
                        <td align="left" style="font-family:Arial,Helvetica,&quot;sans serif&quot;;font-size:14px;line-height:19.6px;font-weight:bold;padding:15px 0px 5px;color:rgb(53,60,66)">What’s Next?</td>
                      </tr>
                      <tr>
                        <td align="left" style="font-family:Arial,Helvetica,&quot;sans serif&quot;;font-size:14px;line-height:19.6px;padding:0px 0px 30.2px;color:rgb(53,60,66)">
                          Don’t forget to have your ticket(s) handy before you head out. To view and access your ticket order, click View Tickets above - or visit <a href="https://tixme.co/customer/dashboard" style="text-decoration:none;font-family:Arial,Helvetica,&quot;sans serif&quot;;color:rgb(0,156,222)" target="_blank" >My Account</a> if you are a member.
                        </td>
                      </tr>
                    
                  </tbody></table>
                </td>
              </tr>
            </tbody></table>
          </td>
        </tr>
      </tbody></table>
    </td>
  </tr>
</tbody></table>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <table width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f7f8f9">
        <tbody><tr>
            <td align="center" style="padding:35px 0px">
                <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tbody><tr>
                        <td align="center" valign="top" style="font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;line-height:20px;text-align:center;color:rgb(75,84,91)">
                            Want to know who else is going?
                        </td>
                    </tr>
                    <tr>
                        <td align="center" valign="top" style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:20px;text-align:center;padding:5px 5px 0px;color:rgb(75,84,91)">
                            Share with your friends and plan to meet-up.
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding:10px 0px 0px">
                            <table cellspacing="0" cellpadding="0" border="0">
                                <tbody><tr>
                                    <td align="left">
                                        <a href="https://www.facebook.com/profile.php?id=61556603844279" style="text-decoration:none;color:rgb(17,162,224)" target="_blank" >
                                            <img border="0" src="${Imgurl + 'social/facebook.png'}" width="32" height="32" style="display:block" class="CToWUd" data-bit="iit">
                                        </a>
                                    </td>
                                    <td align="left" style="padding-left:20px">
                                        <a href="https://www.instagram.com/tixme.co/" style="text-decoration:none;color:rgb(17,162,224)" target="_blank">
                                            <img border="0" src="${Imgurl + 'social/instagram.png'}" width="32" height="32" style="display:block" class="CToWUd" data-bit="iit">
                                        </a>
                                    </td>
                                    <td align="left" style="padding-left:20px">
                                        <a href="https://www.linkedin.com/company/tixme-co/" style="text-decoration:none;color:rgb(17,162,224)" target="_blank">
                                            <img border="0" src="${Imgurl + 'social/linkedin.png'}" width="32" height="32" style="display:block" class="CToWUd" data-bit="iit">
                                        </a>
                                    </td>
                                </tr>
                            </tbody></table>
                        </td>
                    </tr>
                </tbody></table>
            </td>
        </tr>
</tbody></table><table cellpadding="0" cellspacing="0" width="100%" style="min-width:100%"><tbody><tr><td><table border="0" cellpadding="0" cellspacing="0" bgcolor="#009CDE" width="100%">
  <tbody><tr>
   <td align="center">
    <table border="0" cellpadding="0" cellspacing="0" width="480">
     
      <tbody><tr>
       <td align="center" style="max-width:480px" width="480">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
         
          <tbody><tr>
           <td align="left" style="padding:30px 20px">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tbody><tr>
               <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;font-weight:normal;padding:2px 0px 0px;color:rgb(255,255,255)" valign="top">
                <a href="#m_4461797200112429732_m_8759493040611655396_" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;font-weight:normal;padding:2px 0px 0px;text-decoration:none;color:rgb(255,255,255)">TIXME <br> 10 Jalan Besar, #17-02, Sim Lim Tower, Singapore 208787</a><br>
                <br>
                © 2023 TIXME. All rights reserved.</td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table><table cellpadding="0" cellspacing="0" width="100%" style="min-width:100%"><tbody><tr><td>
</td></tr></tbody></table>
                      </td>
                    </tr></center>`;
                await sendMail({
                    email: useremail,
                    subject: transferemail ? "Transfer Ticket" : "Ticket Confirmation",
                    message: emailTemplate,
                    isHtml: true, // Set this to true to indicate that the message is in HTML format
                });
                await sendMail({
                    email: 'tixme.sg@gmail.com',
                    subject: transferemail ? "Transfer Ticket" : "Ticket Confirmation",
                    message: emailTemplate,
                    isHtml: true, // Set this to true to indicate that the message is in HTML format
                });
            await Order.updateOne({ _id: order._id }, { ismail: true });

                // Send the email using your preferred mailer (e.g., nodemailer)
            }
        }}
    } catch (error) {
        console.error("Error sending emails:", error);
        next(error);
    }
});

router.post("/customer/list", async (req, res, next) => {
    try {
        const bearerToken = req.headers.authorization;
        if (!bearerToken) {
            return next(new ErrorHandler("Unauthorized", 400));
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
        const ordersWithItems = await Ordersevent.aggregate([
            {
                $match: {
                    customer_id: userid,
                    status: "1",
                }
            },
            {
                $addFields: {
                    convertedOrderId: { $toObjectId: "$event_id" }
                }
            },
            {
                $lookup: {
                    from: 'events',
                    localField: 'convertedOrderId',
                    foreignField: '_id',
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
            data: ordersWithItems
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/ticket-list", async (req, res, next) => {
    try {
        const { id } = req.body;
        const order_id = id;
        const list = await Orderitem.find({ order_id });
        res.status(200).json({
            success: true,
            data: list
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/ticket-list-by-event-tickets", async (req, res, next) => {
    try {
        const { eventid, ticketname } = req.body;
        const list = await Orderitem.find({ ticket_name: ticketname, eventid: eventid, isvalid: 0 });
        res.status(200).json({
            success: true,
            data: list
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.get("/ticketcount", async (req, res, next) => {
    try {
        const count = await Orderitem.countDocuments({ eventid: "66b329ee031d1eb59b984b16", scan_status: 1 });
        res.status(200).json({ totalCount: count });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/app-qr-code-validate", async (req, res, next) => {
    try {
      const { id, organizerid, eventid } = req.body;
      const list = await Orderitem.findOne({ _id: id });
  
      if (!list) {
        return res.status(404).json({
          success: false,
          data: "Ticket not found!"
        });
      }
  
      const orderidcheck = await Order.findOne({ _id: list.order_id });
      if (orderidcheck.payment_status != 1) {
        return res.status(404).json({
          success: false,
          data: "Ticket not found!"
        });
      }
  
      const EventData = await Event.findOne({ _id: list.eventid });
  
      if (!EventData) {
        return res.status(404).json({
          success: false,
          data: "This event is deleted or canceled!"
        });
      }
  
      // Check if the eventid from the request matches the list.eventid
      if (list.eventid.toString() !== eventid) {
        return res.status(400).json({
          success: false,
          data: `Event ID mismatch! Expected event: ${EventData.name}, but received event ID does not match.`
        });
      }
  
      const timeZone = EventData.timezone;
      var finaltimezone = typeof timeZone == 'string' ? timeZone : timeZone.value;
  
      const TicketArray = EventData.allprice;
      const GetticketData = TicketArray.find(ticket => ticket.id === list.ticket_id);
  
      const organizerid_check = list.eventdata.organizer_id;
      if (organizerid_check != organizerid) {
        return res.status(400).json({
          success: false,
          data: "Invalid organizer!"
        });
      }
  
      if (list.isvalid != 0) {
        return res.status(404).json({
          success: false,
          data: "Ticket not valid!"
        });
      }
  
      if (list.scan_status == 1) {
        return res.status(404).json({
          success: false,
          data: "Ticket already scanned!"
        });
      }
  
      if (GetticketData) {
        const ScanStartDate = GetticketData.scanstartdate;
        const ScanStartTime = GetticketData.scanstarttime;
        if (ScanStartDate && ScanStartTime) {
          const IsScanDatetimeValid = isScanDateTimeValid(ScanStartDate, ScanStartTime, finaltimezone);
          if (!IsScanDatetimeValid) {
            return res.status(404).json({
              success: false,
              data: "Ticket scan start from " + ScanStartDate + ' - ' + ScanStartTime
            });
          }
        }
      }
  
      const updateData = { scan_status: 1 };
      const update = await Orderitem.updateOne({ _id: id }, updateData);
  
      if (update.modifiedCount === 1) {
        const Result = await Orderitem.findOne({ _id: id });
        res.status(201).json({
          success: true,
          data: Result,
          EventData: EventData,
          TicketData: GetticketData,
        });
      } else {
        res.status(400).json({
          success: false,
          data: "Try again!"
        });
      }
  
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  });
  
router.post("/qr-code-validate", async (req, res, next) => {
    try {
        const { id, organizerid } = req.body;
        const list = await Orderitem.findOne({ _id: id });
        if (!list) {
            res.status(404).json({
                success: false,
                data: "Ticket not found!"
            });
        }
        const EventData = await Event.findOne({ _id: list.eventid });
        var finaltimezone;
        const timeZone =  EventData.timezone;
        if(typeof timeZone == 'string'){
            finaltimezone = timeZone;
        }else{
            finaltimezone = timeZone.value
        }
        if (!EventData) {
            res.status(404).json({
                success: false,
                data: "This event is deleted or canceled!"
            });
        }
        const TicketArray = EventData.allprice;
        const GetticketData = TicketArray.find(ticket => ticket.id === list.ticket_id);
        const organizerid_check = list.eventdata.organizer_id;
        if (organizerid_check != organizerid) {
            res.status(400).json({
                success: false,
                data: "Invalid organizer!"
            });
        } else {
            if (list.isvalid != 0) {
                res.status(404).json({
                    success: false,
                    data: "Ticket not valid!"
                });
            }
            if (list.scan_status == 1) {
                res.status(404).json({
                    success: false,
                    data: "Ticket already scanned!"
                });
            }
            // ticket_id
            if (GetticketData) {
                const ScanStartDate = GetticketData.scanstartdate;
                const ScanStartTime = GetticketData.scanstarttime;
                if (ScanStartDate && ScanStartTime) {
                    const IsScanDatetimeValid = isScanDateTimeValid(ScanStartDate, ScanStartTime,finaltimezone);
                    if (!IsScanDatetimeValid) {
                        res.status(404).json({
                            success: false,
                            data: "Ticket scan start from " + ScanStartDate + ' - ' + ScanStartTime
                        });
                        return;
                    }
                }
            }       
            const updateData = {};
            updateData.scan_status = 1;
            const update = await Orderitem.updateOne({ _id: id }, updateData);
            const Result = await Orderitem.findOne({ _id: id });
           
            if (update.modifiedCount === 1) {
                res.status(201).json({
                    success: true,
                    data: Result,
                    EventData: EventData,
                    TicketData: GetticketData,
                });
            } else {
                res.status(400).json({
                    success: false,
                    data: "Try again!"
                });
            }
        }


    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/tickets-transfer", async (req, res, next) => {
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
        const { id, email, itemid } = req.body;

        const userid = decodedToken.id;
        const check_isregistre = await Customer.findOne({ email: email });

        if (!check_isregistre) {
            return next(new ErrorHandler("User you are trying to transfer to is not registered with TIXME", 400));
        }
        if (userid == check_isregistre._id) {
            return next(new ErrorHandler("Ticket not transferable same email", 400));
        }
        const OrderSaveDetails = await Ordersevent.findOne({
            _id: id,
        });
        const OrderDetails = await Order.findOne({
            _id: OrderSaveDetails.orderid,
        });
        if (!OrderDetails) {
            return next(new ErrorHandler("No order found", 400));
        }
        const HistoryinsertData = await TransferHistory.create({
            order_id: OrderSaveDetails.orderid,
            event_id: OrderDetails.eventid,
            sender_id: userid,
            recever_id: check_isregistre._id,
        });
        if (!HistoryinsertData && !HistoryinsertData.id) {
            return next(new ErrorHandler("Server error", 400));
        }
        for (const item of itemid) {
            var get_ticket = await Orderitem.findOne({
                _id: item,
                is_transfer: null,
                scan_status: 0,
                isvalid: 0
            });
            if (get_ticket) {
                const insertData = await Tickettransfer.create({
                    historyid: HistoryinsertData.id,
                    order_id: get_ticket.order_id,
                    orderitem_id: get_ticket._id,
                    eventid: get_ticket.eventid,
                    ticket_name: get_ticket.ticket_name,
                    ticket_price: get_ticket.ticket_price,
                    ticket_type: get_ticket.ticket_type,
                    owner_id: get_ticket.owner_id,
                    owner_name: get_ticket.owner_name,
                    owner_email: get_ticket.owner_email,
                    date: Mindate,
                    time: DateValue,
                    mindate: TimeValue,
                    scan_status: get_ticket.scan_status,
                    isvalid: get_ticket.isvalid,
                    eventdata: get_ticket.eventdata
                });

                const updateData = {
                    is_transfer: 1,
                    transferid: insertData._id,
                    owner_name: check_isregistre.name,
                    owner_email: check_isregistre.email,
                    owner_id: check_isregistre._id
                };

                await Orderitem.updateOne({ _id: item }, updateData);
            }

        }


        const orderItemdata = await Orderitem.findOne({ order_id: OrderSaveDetails.orderid });
        const orderData = await Order.findOne({ _id: OrderSaveDetails.orderid });
        if (orderItemdata) {
            const eventData = await Event.findOne({ _id: orderItemdata.eventid });
            const event_name = eventData.name;
            const event_address = eventData.fulladdress || eventData.location;
            const event_date = eventData.start_date;
            const event_time = eventData.start_time;
            const qrcodeurl = 'https://tixme.co/sharetickets/' + HistoryinsertData.id;
            const event_image_url = eventData.thum_image;
            const emailTemplate = `${mailHeader}
                      <div class="email-container">
                        ${event_image_url ? (
                    `<div class="email-header">
                                    <img src="${event_image_url}" alt="Header Image">
                                    </div>`
                ) : ''}
                        <div class="email-body">
                          <h2 class="email-title">${event_name && event_name}</h2>
                          <p class="email-location">${event_address && eventData.location}</p>
                          <p class="email-date">Date: ${event_date && event_date} | Time: ${event_time && event_time}</p>
                          
                          <a href="${qrcodeurl}" class="email-button">View Your Tickets</a>
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

            await sendMail({
                email: email,
                subject: 'Transfer Ticket Confirmation',
                message: emailTemplate,
                isHtml: true, // Set this to true to indicate that the message is in HTML format
            });
        }
        res.status(201).json({
            success: true,
            message: 'Transfer successfully',
        });


    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});
router.post("/payout-request-list", async (req, res, next) => {
    try {
        const { id } = req.body;
        const list = await Payoutlog.find({ organizerid: id }).sort({ _id: -1 }).exec();;
        res.status(201).json({
            success: true,
            data: list
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

router.post("/event/orders-list", async (req, res, next) => {
    try {
        const { eventid, page = 1, limit = 20 } = req.body; // Add page and limit
        const skip = (page - 1) * limit; // Calculate how many documents to skip

        const ordersWithItems = await Order.aggregate([
            {
                $match: {
                    eventid: eventid,
                }
            },
            {
                $addFields: {
                    convertedOrderId: { $toString: "$_id" },
                    convertedCustomerId: { $toObjectId: "$userid" }
                }
            },
            {
                $lookup: {
                    from: 'orderitems',
                    localField: 'convertedOrderId',
                    foreignField: 'order_id',
                    as: 'orderitems',
                }
            },
            {
                $lookup: {
                    from: 'ordersevents',
                    localField: 'convertedOrderId',
                    foreignField: 'orderid',
                    as: 'ordersevent',
                }
            },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'convertedCustomerId',
                    foreignField: '_id',
                    as: 'userdetails',
                }
            },
            {
                $sort: {
                    createdAt: -1 // Sort by createdAt in descending order
                }
            },
            {
                $skip: skip // Skip documents based on the current page
            },
            {
                $limit: limit // Limit the results to the specified number
            }
        ]);

        const totalOrders = await Order.countDocuments({ eventid: eventid }); // Total count of orders
        const totalPages = Math.ceil(totalOrders / limit); // Calculate total pages

        const EventData = await Event.findOne({ _id: eventid });
        const OrderItems = await Orderitem.find({ eventid: eventid, isvalid: 0 });

        res.status(201).json({
            success: true,
            data: ordersWithItems,
            eventdata: EventData,
            orderitems: OrderItems,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalOrders: totalOrders
            }
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});


router.post("/get-order-items", async (req, res, next) => {
    try {
        const { id } = req.body;
        const OrderiSaveData = await Ordersevent.findOne({ _id: id });
        const Orderitemlist = await Orderitem.find({ order_id: OrderiSaveData.orderid, isvalid: 0, ticket_name: OrderiSaveData.ticket_name }).sort({ _id: -1 }).exec();
        const OrderData = await Order.findOne({ _id: OrderiSaveData.orderid });
        const CustomerData = await Customer.findOne({ _id: OrderiSaveData.customer_id });

        const seatmapData = await Seatmaplog.aggregate([
            {
                $match: {
                    orderid: OrderiSaveData.orderid,
                    status: true,
                }
            },
            {
                $addFields: {
                    convertedOrderId: { $toObjectId: "$boxid" }
                }
            },
            {
                $lookup: {
                    from: 'seatmaps',
                    localField: 'convertedOrderId',
                    foreignField: '_id',
                    as: 'seatDetails',
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
            data: {
                ordersavedata: OrderiSaveData,
                orderitemlist: Orderitemlist,
                orderData: OrderData,
                customerData: CustomerData,
                seatmapData: seatmapData
            }
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});
router.post("/organization/get-order-items", async (req, res, next) => {
    try {
        const { id } = req.body;
        const Orderitemlist = await Orderitem.find({ order_id: id }).exec();
        const OrderData = await Order.findOne({ _id: id });
        const CustomerData = await Customer.findOne({ _id: OrderData.userid });
        const seatmapData = await Seatmaplog.aggregate([
            {
                $match: {
                    orderid: id,
                    status: true,
                }
            },
            {
                $addFields: {
                    convertedOrderId: { $toObjectId: "$boxid" }
                }
            },
            {
                $lookup: {
                    from: 'seatmaps',
                    localField: 'convertedOrderId',
                    foreignField: '_id',
                    as: 'seatDetails',
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
            data: {
                orderitemlist: Orderitemlist,
                orderData: OrderData,
                customerData: CustomerData,
                seatmapData: seatmapData
            }
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});
router.post("/get-package-withpercentage", async (req, res, next) => {
    try {
        const packages = await Packageplan.find();

        // Find the maximum purchase amount
        const maxPurchaseAmount = Math.max(...packages.map(pkg => parseInt(pkg.purchase_amount)));

        // Add percentage to each package
        const packagesWithPercentage = packages.map(pkg => {
            const purchaseAmount = parseInt(pkg.purchase_amount);
            const percentage = (purchaseAmount / maxPurchaseAmount) * 100;
            return {
                ...pkg.toObject(),
                percentage: percentage.toFixed(0) // toFixed(2) to keep two decimal places
            };
        });

        res.status(200).json({
            success: true,
            data: packagesWithPercentage,
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

router.post("/calculate-per", async (req, res, next) => {
    try {
        const { id } = req.body;
        const userid = id;
        const user = await Customer.findOne({ _id: userid });

        // if (!user) {
        //     return res.status(400).json({ message: "No wallet balance or user not found" });
        // }
        // if (user.wallet <= 0) {
        //     return res.status(400).json({ message: "No wallet balance or user not found" });
        // }

        const packages = await Packageplan.find();
        const maxPurchaseAmount = Math.max(...packages.map(pkg => parseInt(pkg.purchase_amount, 10)));
        const walletPercentage = Math.floor((user.wallet / maxPurchaseAmount) * 100);

        // Find the next target package
        const sortedPackages = packages.sort((a, b) => parseInt(a.purchase_amount) - parseInt(b.purchase_amount));

        let currentPackage = null;
        for (const pkg of sortedPackages) {
            if (parseInt(pkg.purchase_amount) <= user.wallet) {
                currentPackage = pkg;
            } else {
                break; // Break the loop once we've found the highest applicable package
            }
        }

        let currentPackageData = {};
        if (currentPackage) {
            currentPackageData = {
                id: currentPackage._id,
                name: currentPackage.name,
                purchaseAmount: currentPackage.purchase_amount,
            };
        }

        const nextTarget = sortedPackages.find(pkg => parseInt(pkg.purchase_amount) > user.wallet);
        let pointsToNextTarget = 0;
        let nextTargetData = {};

        if (nextTarget) {
            pointsToNextTarget = parseInt(nextTarget.purchase_amount) - user.wallet;
            nextTargetData = {
                id: nextTarget._id,
                name: nextTarget.name,
                purchaseAmount: nextTarget.purchase_amount,
                pointsToNextTarget: pointsToNextTarget
            };
        }

        res.status(200).json({
            success: true,
            data: walletPercentage,
            mypoint: user.wallet,
            currentPackage: currentPackageData,
            nextTarget: nextTargetData
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});
router.post("/mail-order-details", async (req, res, next) => {
    try {
        const { orderid } = req.body;
        const OrderData = await Order.findOne({ _id: orderid });
        const OrderItems = await Orderitem.find({ order_id: orderid });
        const seatmapData = await Seatmaplog.aggregate([
            {
                $match: {
                    orderid: orderid,
                    status: true,
                }
            },
            {
                $addFields: {
                    convertedOrderId: { $toObjectId: "$boxid" }
                }
            },
            {
                $lookup: {
                    from: 'seatmaps',
                    localField: 'convertedOrderId',
                    foreignField: '_id',
                    as: 'seatDetails',
                }
            },
            {
                $sort: {
                    createdAt: -1 // Sort by createdAt in descending order
                }
            }
        ]);

        if (OrderData && OrderItems) {
            res.status(200).json({
                success: true,
                order: OrderData,
                qr: OrderItems,
                seatmapData: seatmapData
            });
        } else {
            return next(new ErrorHandler("Order Not Found", 400));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});
router.post("/share-order-details", async (req, res, next) => {
    try {
        const { orderid } = req.body;
        const HistoryData = await TransferHistory.findOne({ _id: orderid });
        const OrderData = await Order.findOne({ _id: HistoryData.order_id });
        const OrderItems = await Orderitem.find({ order_id: HistoryData.order_id, owner_id: HistoryData.recever_id });
        const seatmapData = await Seatmaplog.aggregate([
            {
                $match: {
                    orderid: HistoryData.order_id,
                    status: true,
                }
            },
            {
                $addFields: {
                    convertedOrderId: { $toObjectId: "$boxid" }
                }
            },
            {
                $lookup: {
                    from: 'seatmaps',
                    localField: 'convertedOrderId',
                    foreignField: '_id',
                    as: 'seatDetails',
                }
            },
            {
                $sort: {
                    createdAt: -1 // Sort by createdAt in descending order
                }
            }
        ]);

        if (OrderData && OrderItems) {
            res.status(200).json({
                success: true,
                order: OrderData,
                qr: OrderItems,
                seatmapData: seatmapData
            });
        } else {
            return next(new ErrorHandler("Order Not Found", 400));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});
router.get("/test", async (req, res, next) => {
    // try {
    //     const emailTemplate = `<h1>ki</h1>`;
    //     await sendMail({
    //         email: 'amit.techartist@gmail.com',
    //         subject: 'Event Approval Request',
    //         message: emailTemplate,
    //         isHtml: true,
    //     });
    //     res.status(200).json({
    //         success: true,
    //         data: "sds"
    //     });

    // } catch (error) {
    //     return next(new ErrorHandler(error.message, 400));
    // }
    await Orderitem.deleteMany();
    await Order.deleteMany();
    await Ordersevent.deleteMany();
    await Support.deleteMany();
    await Contact.deleteMany();
    await Tickettransfer.deleteMany();
    await TransferHistory.deleteMany();
    await Event.deleteMany();
    // await Organizer.deleteMany();


    // const r = await Packageplan.find();
    // res.status(200).json({
    //     success: true,
    //     data: "sds"
    // });

    // try {

    // const deleteImage = async (imageUrl) => {
    //     const filename = imageUrl.split('/').pop();
    //     try {
    //         const response = await axios.post('https://tixme.co/tixme_storage/api/delete-image', { file_name: filename });
    //         console.log('Image deleted response:', response.data);
    //     } catch (error) {
    //         console.error('Error deleting the image:', error);
    //         // Handle error accordingly
    //     }
    // };
    // await deleteImage('https://tixme.co/tixme_storage/storage/app/public/5yb1Af5aRg.jpg');
    // const ordersWithItems = await Ordersevent.aggregate([
    //     {
    //         $addFields: {
    //             convertedOrderId: { $toObjectId: "$event_id" }
    //         }
    //     },
    //     {
    //         $lookup: {
    //             from: 'events',
    //             localField: 'convertedOrderId',
    //             foreignField: '_id',
    //             as: 'orderData',
    //         }
    //     }
    // ]);

    // const d = CalculateDuration('20231201', '10:00 AM', '20231202', '10:00 PM');
    // res.status(200).json({
    //     success: true,
    //     data: d
    // });
    // await Orderitem.deleteMany();
    // await Order.deleteMany();
    // await Ordersevent.deleteMany();
    // res.status(200).json({
    //     success: true,
    //     data: 1
    // });
    // } catch (error) {
    //     console.error("Aggregation Error:", error);
    //     return next(new ErrorHandler(error.message, 500));
    // }


    // try {
    //     const id = "656edcf6d46b8af0e5591822";
    //     const list = await Event.findOne({ _id: id });

    //     if (list) {
    //         const OrganizerData = await Organizer.findOne({ _id: list.organizer_id });
    //         const Ticketbooklist = await Orderitem.find({ eventid: id, isvalid: 0 });

    //         // Step 1 and 2: Extract unique owner_email addresses
    //         const emailSet = new Set();
    //         Ticketbooklist.forEach(item => {
    //             emailSet.add(item.owner_email);
    //         });
    //         const uniqueEmails = Array.from(emailSet);

    //         // Step 3: Find customers based on the email array
    //         const customer_list = await Customer.find({ email: { $in: uniqueEmails } });

    //         res.status(200).json({
    //             success: true,
    //             data: list,
    //             bookinglist: Ticketbooklist,
    //             organizer: OrganizerData,
    //             customers: customer_list
    //         });
    //     } else {
    //         return next(new ErrorHandler("Event not found", 400));
    //     }

    // } catch (error) {
    //     return next(new ErrorHandler(error.message, 400));
    // }


});

router.post("/get-taxes", async (req, res, next) => {
    try {
        const { eventid } = req.body;
        const TaxData = await Eventtax.find({ eventid: eventid });
        const taxAmounts = TaxData.map(item => ({
            name: item.taxtitle,
            taxamount: item.taxamount,
            taxtype: item.taxtype,
            isglobal:item.isglobal,
            ticket_id:item.ticketid,
        }));

        res.status(200).json({
            success: true,
            data: taxAmounts
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/payout-request", async (req, res, next) => {
    try {
        const { id, amount } = req.body;
        const OrganizerData = await Organizer.findOne({ _id: id });
        if (OrganizerData) {
            if (OrganizerData.bankaccount && OrganizerData.bankname && OrganizerData.holdername && OrganizerData.swiftcode) {
                const inserPayout = await Payoutlog.create({
                    amount: amount,
                    status: 0,
                    organizerid: OrganizerData.id,
                    organizername: OrganizerData.name,
                    country: OrganizerData.countryname,
                    organizer_data: OrganizerData,
                    date: DateValue,
                    mindate: Mindate,
                    time: TimeValue,
                });
                res.status(201).json({
                    success: true,
                    message: 'Payout request successfully'
                });
            } else {
                return next(new ErrorHandler("please update your bank details in profile update and try again", 403));
            }
        } else {
            return next(new ErrorHandler("No data found", 403));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});
// router.post("/update-orderdetails", async (req, res, next) => {
//     try {
//         const { orderid, cartdata } = req.body;
//         const orderData = await Order.findOne({ _id: orderid });
//         for (const item of cartdata) {
//             await Orderitem.updateOne(
//                 { _id: item._id },
//                 { $set: { tuser_name: item.name, tuser_gender: item.gender } }
//             );
//         }
//         const gatway_name = "Stripe";
//         if (gatway_name == "Stripe") {
//             // Create a checkout session
//             const session = await stripe.checkout.sessions.create({
//                 "payment_method_types": [
//                     "card",
//                 ],
//                 line_items: [
//                     {
//                         price_data: {
//                             currency: "inr",
//                             product_data: {
//                                 name: "test",
//                             },
//                             unit_amount: orderData.amount * 100, // Stripe uses the amount in cents
//                         },
//                         quantity: 1,
//                     },
//                 ],
//                 mode: "payment",
//                 success_url: process.env.KON_SUCCESS_URL || "http://localhost:3000/tixme_ui/order-successful-page",
//                 cancel_url: process.env.KON_CANCEL_URL || "http://localhost:3000/tixme_ui/order-failed-page",
//             });
//             if (session.url && session.id) {
//                 const updateData = {};
//                 updateData.payment_id = session.id;
//                 updateData.gatway_res = session;
//                 const payment_id_insert = await Order.updateOne({ _id: orderid }, updateData);
//                 await Ordersevent.updateMany({ orderid: orderid }, { payment_id: session.id });
//                 if (payment_id_insert.modifiedCount === 1) {
//                     res.status(200).json({
//                         success: true,
//                         url: session.url,
//                         payment_id: session.id,
//                     });
//                 } else {
//                     res.status(404).json({
//                         success: false,
//                         data: 'Payment id insert update failed'
//                     });
//                 }
//             } else {
//                 res.status(401).json({
//                     success: false,
//                     data: "stripe payment gatway failed!",
//                 });
//             }
//         } else {
//             return next(new ErrorHandler("Server error try again", 400));
//         }
//     } catch (error) {
//         return next(new ErrorHandler(error.message, 400));
//     }
// });
// router.post("/get-cartdata", async (req, res, next) => {
//     try {
//         const { orderid } = req.body;
//         const result = await Order.findOne({ _id: orderid, payment_status: 0, isdelete: 0 });
//         if (result) {
//             const cartitem = await Orderitem.aggregate([
//                 {
//                     $match: {
//                         order_id: orderid
//                     }
//                 },
//                 {
//                     $addFields: {
//                         convertedOrderId: { $toObjectId: "$eventid" }
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: 'events',
//                         localField: 'convertedOrderId',
//                         foreignField: '_id',
//                         as: 'maineventData',
//                     }
//                 },
//                 {
//                     $sort: {
//                         createdAt: -1 // Sort by createdAt in descending order
//                     }
//                 }
//             ]);

//             res.status(200).json({
//                 success: true,
//                 listitem: cartitem,
//                 data: result
//             });
//         } else {
//             return next(new ErrorHandler("Cart detils not found", 400));
//         }
//     } catch (error) {
//         return next(new ErrorHandler(error.message, 400));
//     }

// });
// router.post("/cartdata/insert", async (req, res, next) => {
//     try {
//         const { cartitem, totalamount } = req.body;
//         const bearerToken = req.headers.authorization;
//         if (!bearerToken) {
//             return next(new ErrorHandler("Unauthorized", 401));
//         }
//         const activation_token = bearerToken.split(' ')[1];

//         const decodedToken = jwt.verify(
//             activation_token,
//             process.env.JWT_SECRET_KEY
//         );

//         if (!decodedToken) {
//             return next(new ErrorHandler("Invalid token", 400));
//         }
//         const userid = decodedToken.id;
//         const userData = await Customer.findOne({ _id: userid });
//         if (!userData) {
//             res.status(401).json({
//                 success: false,
//                 data: "User data not found",
//             });
//         }
//         const id = userData._id;
//         const name = userData.name;
//         const email = userData.email;
//         const items = cartitem;
//         const amount = totalamount;
//         const mindate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
//         const date = new Date().toLocaleDateString('en-GB', {
//             day: '2-digit',
//             month: '2-digit',
//             year: 'numeric'
//         }).replace(/\//g, '-');
//         const time = new Date().toLocaleTimeString('en-US', {
//             hour: '2-digit',
//             minute: '2-digit',
//             hour12: true
//         });
//         const payment_status = 0;
//         const isdelete = 0;
//         const insertData = await Order.create({
//             userid,
//             year: OnlyYear,
//             name,
//             email,
//             items,
//             amount,
//             mindate,
//             date,
//             time,
//             payment_status,
//             isdelete
//         });
//         const orderInsetid = insertData.id;
//         if (orderInsetid) {
//             const orderEventItem = cartitem.flatMap((item, index) => ({
//                 orderid: orderInsetid,
//                 customer_id: id,
//                 customer_name: name,
//                 ticket_name: item.name,
//                 ticket_price: item.price,
//                 organizer_id: item.event.organizer_id,
//                 event_id: item.event._id,
//                 bookingid: generateUUID(),
//                 status: 0,
//                 date: DateValue,
//                 time: TimeValue,
//                 mindate: Mindate,
//                 currency: item.event.countrysymbol,
//                 currency_name: item.event.currencycode,
//                 order_amount: totalamount,
//             }));

//             const createdOrderEvents = await Ordersevent.insertMany(orderEventItem);

//             const orderItems = cartitem.flatMap((item, index) => {
//                 const repeatedItems = Array.from({ length: item.quantity }, (_, i) => ({
//                     order_id: orderInsetid,
//                     eventid: item.eventId,
//                     ticket_name: item.name,
//                     ticket_price: item.price,
//                     ticket_type: item.ticket_type,
//                     user_email: email,
//                     user_name: name,
//                     owner_id: id,
//                     owner_name: name,
//                     owner_email: email,
//                     scan_status: 0,
//                     isvalid: 1,
//                     mindate: Mindate,
//                     date: DateValue,
//                     time: TimeValue,
//                     organizer_id: item.event.organizer_id,
//                     bookingid: generateUUID(),
//                     eventdata: {
//                         id: item.event._id,
//                         eventtype: item.event.eventtype,
//                         display_name: item.event.display_name,
//                         category_name: item.event.category_name,
//                         start_date: item.event.start_date,
//                         start_time: item.event.start_time,
//                         end_date: item.event.end_date,
//                         organizer_id: item.event.organizer_id,
//                         location: item.event.location,
//                         mindate: item.event.mindate,
//                     },
//                 }));
//                 return repeatedItems;
//             });
//             const createdOrderItems = await Orderitem.insertMany(orderItems);

//             if (!createdOrderItems) {
//                 return next(new ErrorHandler("Ticket item not inserted!", 400));
//             } else {
//                 res.status(200).json({
//                     success: true,
//                     data: orderInsetid
//                 });
//             }
//         } else {
//             return next(new ErrorHandler("Order insert failed!", 400));
//         }
//     } catch (error) {
//         return next(new ErrorHandler(error.message, 400));
//     }
// });

module.exports = router;
// /membership-check
// /razorpay/checkout
// /hitpay/checkou
// /update-orderdetails
// /get-cartdata
// /cartdata/insert
// /stripe/checkout
// /stripe/success-check
// /order-confirmation-mail
// /customer/list
// /ticket-list
// /ticket-list-by-event-tickets
// /qr-code-validate
// /tickets-transfer
// /payout-request-list
// /event/orders-list
// /get-order-items
// /get-package-withpercentage
// /calculate-per
// /test
// /get-taxes
// /payout-request
// /mail-order-details
// /manual-status-update