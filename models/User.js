const mongoose = require('mongoose'),
    Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

var UserSchema = new Schema({
    userName:{
        type: String
    },
    fullName: {
        type: String,
        trim: true
    },
    profilePicture:{
        type: String,
    },
    gender:{
        type: String
    },
    countryCode: {
        type: String,
        default: "+1"
    },
    mobile: {
        type: String
    },
    formattedMobile: {
        type: String
    },
    email:{
        type: String
    },
    password: {
        type: String
    },
    otp: {
        type: String,
        default: ""
    },
    otpExp: {
        type: Number
    },
    dob:{
        type: Number
    },
    termsCond:{
        type: Boolean
    },
    emailToken:{
        type: String
    },
    isEmailVerified:{
        type: Boolean,
        default: false
    },
    address:{
        type:String,
        trim: true
    },
    zipcode:{
        type: Number,
    },
    isNotification:{
        type: Boolean,
        default: true
    },
    shop:{
        type: Schema.Types.ObjectId,
        ref: "Shop"
    },
    deviceToken: {
        type: String,
        required: false,
        trim:true,
        default: "",
    },
    status: {
        type: Boolean,
        default: true
    },
    shopStatus:{
        type: Boolean,
        default:false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    tempToken: {
        type: String,
        default: ""
    },
    otpVerify: {
        type: Boolean,
        default: false
    },
    step:{
        type: Number
    },
    updatedMobile:{
        type:Number
    },
    isCompProfile:{
        type: Boolean,
        default: false
    },
    emailNotification:{
        type: Boolean,
        default: true
    },
    iat: {
        type: Number,
    },
    role:{
        type: String,
        enum: ["User", "Barber"],
    },
    deviceTokens: [
        {
            platform: {
                type: String,
                trim: true
            },
            token: {
                type: String,
                trim: true
            },
            deviceId: {
                type: String,
                trim: true
            },
        }
    ],
}, {
    timestamps: true,
    id: false,
    collection: 'users',
    toJSON: {
        getters: true,
        virtuals: true
    },
    toObject: {
        getters: true,
        virtuals: true
    }
});
UserSchema.index({ isDeleted: 1, status: 1 });
UserSchema.virtual('appointments', {
    ref: 'Appointment', 
    localField: '_id', 
    foreignField: 'barber', 
    justOne: false,
    count: true
 });

module.exports.User = mongoose.model('User', UserSchema);
