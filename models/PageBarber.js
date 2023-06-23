'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PageBarberSchema = new Schema({

    title: {
        type: String,
        trim: true
    },
    slug: {
        type: String,
    },
    desc: {
        type: String,
        trim: true
    },
    facebook: {
        type: String,
        trim: true
    },
    twitter: {
        type: String,
        trim: true
    },
    instagram: {
        type: String,
        trim: true
    }
}, {
    id: false,
    timestamps: true,
    collection: 'pagesBarber',
    toJSON: {
        getters: true,
        virtuals: true
    },
    toObject: {
        getters: true,
        virtuals: true
    }
});

PageBarberSchema.index({ title: 1, createdAt: 1, });
module.exports.PageBarber = mongoose.model('PageBarber', PageBarberSchema);
