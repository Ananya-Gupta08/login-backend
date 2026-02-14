import mongoose from "mongoose";

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
  role: {
  type: String,
  enum: ["admin", "manager", "staff", "customer"],
  default: "customer",
},

});
export default mongoose.model('User', userSchema);
