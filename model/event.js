const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    eventtype: {
        type: String,
        
        // 1 = online | 2 = Physical
    },
    event_type_name: {
        type: String,
        
        // 1 = online | 2 = Physical
    },
    name: {
        type: String,
        
    },
    isfreeticket: {
        type: String
    },
    display_name: {
        type: String,
        
    },
    type: {
        type: Object,
        
    },
    category: {
        type: String,
        
    },
    category_name: {
        type: String,
        
    },
    tags: {
        type: Object,
        
    },
    visibility: {
        type: Number,
         // Public = 1 | Private = 2
    },
    admin_publish: {
        type: Number,
         // show = 1 | hide = 2
    },
    location: {
        type: String,
        
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    pincode: {
        type: String,
    },
    country: {
        type: String,
    },
    mindate: {
        type: String,
    },
    start_data_min: {
        type: Array,
    },
    end_data_min: {
        type: Array,
    },
    date: {
        type: String,
    },
    organizer_name: {
        type: String,
    },
    organizer_logo: {
        type: String,
    },
    displayprice: {
        type: Number,
    },
    displaycutprice: {
        type: String,
    },
    pincode: {
        type: String,
    },
    fulladdress: {
        type: String,
    },
    displayaddress: {
        type: String,
    },
    event_subtype_id: {
        type: String,
        
    },
    start_date: {
        type: String,
        
    },
    start_year: {
        type: String
    },
    start_month: {
        type: String
    },
    start_yearmonth: {
        type: String
    },
    start_time: {
        type: String,
        
    },
    start_time_min: {
        type: Array,
        
    },
    end_date: {
        type: String,
        
    },
    end_time: {
        type: String,
        
    },
    end_time_min: {
        type: Array,
        
    },
    is_clock_countdown: {
        type: Boolean,
        
    },
    isendtimeoptional: {
        type: Boolean,
    },
    eventhide: {
        type: Boolean,
    },
    is_selling_fast: {
        type: Boolean,
        
    },
    is_soldout: {
        type: Boolean,
        
    },
    tickethide: {
        type: Boolean,
        
    },
    display_start_time: {
        type: Boolean,
        
    },
    display_end_time: {
        type: Boolean,
        
    },
    event_desc: {
        type: String,
        // 
    },
    banner_image: {
        type: String
    },
    thum_image: {
        type: String
    },
    organizer_id: {
        type: String,
        
    },
    allprice: {
        type: Object
        // original ticket price
    },
    event_dates: {
        type: Object
        // original ticket price
    },
    price: {
        type: Number
        // original ticket price
    },
    cut_price: {
        type: Number
        // cut price show as cur format
    },
    status: {
        type: Number,
        
        // 0 = pending | 1 = active | 2 = reject
    },
    countryname: {
        type: String
    },
    lat: {
        type: String
    },
    Lag: {
        type: String
    },
    currencycode: {
        type: String
    },
    start_mindate: {
        type: String
    },
    end_mindate: {
        type: String
    },
    countrysymbol: {
        type: String
    },
    event_duration: {
        type: String
    },
    timezone: {
        type: Object
    },
    eventjoinurl: {
        type: String
    },
    isdelete: {
        type: Number,        
        // 0 = not delete | 1 = deleted
    },
    uniqueid: {
        type: Number,
    },
    tixmefee: {
        type: Number,
    },
    pageheight: {
        type: String,
    },
    pageweight: {
        type: String,
    },
    seatmapimage: {
        type: String,
    },
    platformfee: {
        type: Number,
    },
    seatmap: {
        type: Boolean,
    }  
},
    {
        timestamps: true,
        versionKey: false
    }
);
module.exports = mongoose.model("Event", userSchema);