const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter category!"],
    },
    purchase_amount: {
        type: String,
        required: [true, "Please enter purchase amount!"],
    },
    discount_amount: {
        type: String,
        required: [true, "Please enter discount amount!"],
    },
    isdelete: {
        type: Number,
        required: [true, "Please enter isdelete value 0 for no delete 1 for delete"],
    },
},
    {
        timestamps: true,
        versionKey: false
    }
);
module.exports = mongoose.model("Packageplan", userSchema);