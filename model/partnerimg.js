const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    img_url: {
        type: String,
        required: [true, "Please add image!"],
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
module.exports = mongoose.model("Partnerimg", userSchema);