const express = require("express");
const Category = require("../model/category");
const Eventtype = require("../model/eventtype");
const router = express.Router();
const Event = require("../model/event");
const ErrorHandler = require("../utils/ErrorHandler");

// create user
router.post("/aaa", async (req, res, next) => {
    try {
        res.status(201).json({
            success: true,
            data: 1
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/create-category", async (req, res, next) => {
    try {
        const { name, isdelete } = req.body;
        const checkCategory = await Category.findOne({ name, isdelete: 0 });
        if (checkCategory) {
            return next(new ErrorHandler("Category already exist", 400));
        }
        const insertData = await Category.create({
            name,
            isdelete
        });
        res.status(201).json({
            success: true,
            data: insertData
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/get-category-list", async (req, res, next) => {
    try {
        const categories = await Category.find({ isdelete: 0 }).sort({ name: 1 }).exec();
        res.status(201).json({
            success: true,
            data: categories
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/delete-category", async (req, res, next) => {
    try {
        const { id, isdelete } = req.body;
        const check = await Event.countDocuments({ category: id, isdelete: 0 });
        if (check > 0) {
            return next(new ErrorHandler("Delete all events for this category first !", 400));
        }
        const result = await Category.updateOne({ _id: id }, { isdelete: isdelete });
        if (result.modifiedCount === 1) {
            res.status(200).json({
                success: true,
                data: 'Category deleted successfully'
            });
        } else {
            res.status(404).json({
                success: true,
                data: 'Category not found'
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/update-category", async (req, res, next) => {
    try {
        const { id, name } = req.body;
        const result = await Category.updateOne({ _id: id }, { name });
        if (result.modifiedCount === 1) {
            const updateData = await Category.findOne({ _id: id });
            res.status(200).json({
                success: true,
                data: updateData
            });
        } else {
            res.status(404).json({
                success: false,
                data: 'Category not found'
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

router.post("/create-event-type", async (req, res, next) => {
    try {
        const { name, isdelete } = req.body;
        const checkCategory = await Eventtype.findOne({ name, isdelete: 0 });
        if (checkCategory) {
            return next(new ErrorHandler("Event type already exist", 400));
        }
        const insertData = await Eventtype.create({
            name,
            isdelete
        });
        res.status(201).json({
            success: true,
            data: insertData
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/get-event-type-list", async (req, res, next) => {
    try {
        const categories = await Eventtype.find({ isdelete: 0 }).sort({ _id: -1 }).exec();
        res.status(201).json({
            success: true,
            data: categories
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/delete-event-type", async (req, res, next) => {
    try {
        const { id, isdelete } = req.body;
        const result = await Eventtype.updateOne({ _id: id }, { isdelete: isdelete });
        if (result.modifiedCount === 1) {
            res.status(200).json({
                success: true,
                data: 'Event type deleted successfully'
            });
        } else {
            res.status(404).json({
                success: true,
                data: 'Event type not found'
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/update-event-type", async (req, res, next) => {
    try {
        const { id, name } = req.body;
        const result = await Eventtype.updateOne({ _id: id }, { name });
        if (result.modifiedCount === 1) {
            const updateData = await Eventtype.findOne({ _id: id });
            res.status(200).json({
                success: true,
                data: updateData
            });
        } else {
            res.status(404).json({
                success: false,
                data: 'Event type not found'
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
module.exports = router;