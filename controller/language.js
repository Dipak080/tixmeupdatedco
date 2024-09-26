const express = require("express");
const Language = require("../model/language");
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");

// create user
router.post("/create", async (req, res, next) => {
    try {
        const { name,isdelete } = req.body;
        const check = await Language.findOne({ name });
        if (check) {
            return next(new ErrorHandler("Category already exist", 400));
        }
        const insertData = await Language.create({
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
router.post("/get-list", async (req, res, next) => {
    try {
        const result = await Language.find({ isdelete: 0 }).sort({ _id: -1 }).exec();
        res.status(201).json({
            success: true,
            data: result
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/delete", async (req, res, next) => {
    try {
        const { id,isdelete } = req.body;
        const result = await Language.updateOne({ _id: id }, { isdelete: isdelete });
        if (result.modifiedCount === 1) {
            res.status(200).json({
                success: true,
                data: 'Deleted successfully'
            });
        } else {
            res.status(404).json({
                success: true,
                data: 'Data not found'
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/update", async (req, res, next) => {
    try {
        const { id,name } = req.body;
        const result = await Language.updateOne({ _id: id }, { name });
        if (result.modifiedCount === 1) {
            const updateData = await Language.findOne({ _id: id });    
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
module.exports = router;