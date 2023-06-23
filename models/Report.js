'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ReportSchema = new Schema({

    tUser: Number,
    tBarber: Number,
    tBooking: Number,
    activeUser: Number,
    activeShop: Number,
    tRequest: Number,
    tCancelRequest: Number,
    deliveryCharge: Number
}, {
    id: false,
    timestamps: true,
    collection: 'reports',
    toJSON: {
        getters: true,
        virtuals: true
    },
    toObject: {
        getters: true,
        virtuals: true
    }
});

module.exports.Report = mongoose.model('Report', ReportSchema);
