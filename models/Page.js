'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PageSchema = new Schema({

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
    collection: 'pages',
    toJSON: {
        getters: true,
        virtuals: true
    },
    toObject: {
        getters: true,
        virtuals: true
    }
});

PageSchema.index({ title: 1, createdAt: 1, });
module.exports.Page = mongoose.model('Page', PageSchema);
