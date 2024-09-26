const express = require("express");
const ErrorHandler = require("./middleware/error");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors"); // Import the cors middleware

const corsOptions = {
  origin: ['https://tixme.co', 'http://localhost:3000'], 
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type, Authorization',
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use('/uploads', express.static('uploads'));

// const path = require('path')
// app.use('/static', express.static(path.join(__dirname, 'public')))

// config
if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({
      path: "config/.env",
    });
}

// import routes
const user = require("./controller/user");
// Mount the userRouter at the desired base URL
const category = require("./controller/category");
const language = require("./controller/language");
const auth = require("./controller/auth");
const admin = require("./controller/admin");
const event = require("./controller/event");
const website = require("./controller/website");
const order = require("./controller/order");

// Mount the userRouter at the desired base URL
const api_url = '/api/v1/';
app.use(api_url+'user', user);
app.use(api_url+'category', category);
app.use(api_url+'language', language);
app.use(api_url+'auth', auth);
app.use(api_url+'admin', admin);
app.use(api_url+'event', event);
app.use(api_url+'website', website);
app.use(api_url+'order', order);

// it's for ErrorHandling
app.use(ErrorHandler);

module.exports = app;
