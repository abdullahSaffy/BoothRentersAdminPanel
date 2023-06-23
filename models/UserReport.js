'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserReportSchema = new Schema({

    reportBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reportedTo:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    appointmentId:{
        type: Schema.Types.ObjectId,
        ref: "Appointment"
    },
    reportedFor:{
        type: String,
        trim: true,
        enum: ["Chat", "Appointment"],
    },
    status: {
        type: Boolean,
        default: true
    }
}, {
    id: false,
    timestamps: true,
    collection: 'userReports',
    toJSON: {
        getters: true,
        virtuals: true
    },
    toObject: {
        getters: true,
        virtuals: true
    }
});

module.exports.UserReport = mongoose.model('UserReport', UserReportSchema);
