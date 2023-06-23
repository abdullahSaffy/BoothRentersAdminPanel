const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AppointmentSchema = new Schema({
    reqId: {
        type: String
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    barber: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    shop: {
        type: Schema.Types.ObjectId,
        ref: "Shop"
    },
    startDate: {
        type: Number
    },
    endDate: {
        type: Number,
    },
    tAdult:{
        type: Number
    },
    tChild:{
        type: Number
    },
    timeSlot: {
        type: String,
        trim: true
    },
    person: [{
        isAdult: { type: Boolean },
        gender: { type: String, trim: true },
        age: { type: Number },
        text: { type: String, trim: true },
    }],
    status: {
        type: String,
        enum: ["not-started", "arrived", "ongoing", "completed_unverified", "completed", "expired", "failed", "canceled"],
        default: "not-started"
    },
    amount: {
        type: Number
    },
    description: {
        type: String,
        trim: true
    },
    location: {
        type: [Number],
        default: [75.7713, 26.8922],
        index: '2dsphere'
    },
    address: {
        type: String,
        trim: true
    },
    isCanceled:{
        type: Boolean,
        default: false
    },
    cancelBy:{
        type: String
    },
    cancelReason:{
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    chatId:{
        type: Schema.Types.ObjectId,
        ref: "Chat"
    }
}, {
    timestamps: true,
    id: false,
    collection: 'appointments',
    toJSON: {
        getters: true,
        virtuals: true
    },
    toObject: {
        getters: true,
        virtuals: true
    }
});

module.exports.Appointment = mongoose.model('Appointment', AppointmentSchema);
