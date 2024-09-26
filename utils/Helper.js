const moment = require('moment');
const momenttimezone = require('moment-timezone');
const Mindate = moment().format('YYYYMMDD');
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

const TomorrowMinDate = tomorrow.toISOString().slice(0, 10).replace(/-/g, '');

const DateValue = new Date().toLocaleDateString('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
}).replace(/\//g, '-');

const OnlyYear = new Date().toLocaleDateString('en-GB', {
  year: 'numeric'
}).replace(/\//g, '-');

const TimeValue = new Date().toLocaleTimeString('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true
});

// Function to get only the year (YYYY) from a given date string in the format 'YYYYMMDD'
function getYearFromDate(dateString) {
  return dateString.slice(0, 4);
}

// Function to get only the month (MM) from a given date string in the format 'YYYYMMDD'
function getMonthFromDate(dateString) {
  return dateString.slice(4, 6);
}

function getNextMonth() {
  const nextMonthDate = new Date();
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
  return (nextMonthDate.getMonth() + 1).toString().padStart(2, '0');
}
function getNextMonthAndYear(baseDateString) {
  const baseDate = new Date(`${getYearFromDate(baseDateString)}-${getMonthFromDate(baseDateString)}-01`);
  const nextMonthDate = new Date(baseDate);
  nextMonthDate.setMonth(baseDate.getMonth() + 1);
  const year = nextMonthDate.getFullYear();
  const month = (nextMonthDate.getMonth() + 1).toString().padStart(2, '0');
  return `${year}${month}`;
}

function getSevenDaysAfter(dateString) {
  const baseDate = new Date(`${getYearFromDate(dateString)}-${getMonthFromDate(dateString)}-${dateString.slice(6, 8)}`);
  const sevenDaysAfter = new Date(baseDate);
  sevenDaysAfter.setDate(baseDate.getDate() + 7);

  const year = sevenDaysAfter.getFullYear();
  const month = (sevenDaysAfter.getMonth() + 1).toString().padStart(2, '0');
  const day = sevenDaysAfter.getDate().toString().padStart(2, '0');

  return `${year}${month}${day}`;
}
const currentYear = new Date().getFullYear();
const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
const randomNumber = Math.floor(100000 + Math.random() * 900000);
const generateUniqueIdentifier = `${currentYear}-${randomString}${randomNumber}`;
const CouponCode = `${randomString}${randomNumber}`;

function CalculateDuration(startDate, startTime, endDate, endTime) {
  const format = 'YYYYMMDD hh:mm A';
  const start = moment(startDate + ' ' + startTime, format);
  const end = moment(endDate + ' ' + endTime, format);

  const duration = moment.duration(end.diff(start));
  const days = duration.asDays();
  const hours = duration.asHours() % 24; // Remainder of hours after accounting for full days

  return `${Math.floor(days)} days ${Math.floor(hours)} hours`;
}
function generateTenDigitNumber() {
  return Math.floor(Math.random() * 9000000000) + 1000000000;
}
const Imgurl = 'https://tixme.co/tixme_storage/storage/app/public/';

const isScanDateTimeValid = (date, time,finaltimezone) => {
  const dateParts = date.split(' ');
  const day = dateParts[0];
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(dateParts[1]) + 1;
  const year = dateParts[2];

  const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.padStart(2, '0')}`;
  const dateTime = moment(`${formattedDate} ${time}`, 'YYYY-MM-DD hh:mm A');

  const currentDateTime = momenttimezone.tz(finaltimezone);
  var finalcurrentlocation = currentDateTime.format('YYYY-MM-DD HH:mm:ss')
  return dateTime.isBefore(finalcurrentlocation);
}

function monthDatetoMIn(dateString) {
  const formattedDate = moment(dateString, "DD MMM YYYY").format("YYYYMMDD");
  return formattedDate;
}
const mailHeader = () => {
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
                    </style>
                    </head>
                    <body>
                    <div style="text-align:center;margin-bottom:30px">
                    <img alt="Tixme" height="34" src="${'https://tixme.co/tixme_storage/storage/app/public/applogo/tixmeoriginlogo.png'}" style="border-width: 0px; width: 160px; height: auto;" width="160">
                    </div>`;
  return emailTemplate;
}
const mailFooter = () => {
  const emailTemplate = `<div class="email-footer" style="paddign-top:30px">
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
</html>`;
  return emailTemplate;
}

const AdminEmail = () => {
  return 'tixme.team@gmail.com';
  // return 'amit.techartist@gmail.com';
}
module.exports = { AdminEmail, mailFooter, mailHeader, monthDatetoMIn, isScanDateTimeValid, generateTenDigitNumber, Imgurl, CalculateDuration, Mindate, DateValue, OnlyYear, TimeValue, TomorrowMinDate, getYearFromDate, getMonthFromDate, getNextMonth, getNextMonthAndYear, getSevenDaysAfter, generateUniqueIdentifier, CouponCode };
