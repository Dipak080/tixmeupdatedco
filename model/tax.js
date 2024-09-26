const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    taxamount: {
        type: Number
    },
    isdelete: {
        type: Number, // 0 = active , 1 = deactive
    },
},
    {
        timestamps: true,
        versionKey: false
    }
);
module.exports = mongoose.model("Tax", userSchema);