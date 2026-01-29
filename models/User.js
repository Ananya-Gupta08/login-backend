const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,  
    },
  password: {
  type: String,
  required: function () {
    return this.authProvider !== "google";
  },
},
authProvider: {
  type: String,
  default: "local",
},
   isOtpVerified: {
    type: Boolean,
    default: false
  },
  otp: String,
  otpExpiry: Date,

});

module.exports = mongoose.model('User', userSchema);
