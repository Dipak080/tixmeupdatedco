const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter name!"],
    },
    isdelete: {
        type: Number
    },
},
    {
        timestamps: true,
        versionKey: false
    }
);
module.exports = mongoose.model("Hobby", userSchema);