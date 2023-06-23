const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RequestSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reqId: {
        type: String
    },
    startDate: {
        type: Number
    },
    endDate: {
        type: Number,
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
        enum: ["In-progress", "waiting", "canceled", "expired"],
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
    isDeleted: {
        type: Boolean,
        default: false
    },
    tAdult:{
        type: Number
    },
    tChild:{
        type: Number
    },
    quotation: [
        {
            shop: {
                type: Schema.Types.ObjectId,
                ref: "Shop"
            },
            barber: {
                type: Schema.Types.ObjectId,
                ref: "User"
            },
            offerAmount: {
                type: Number
            },
            status: {
                type: String,
                enum: ["canceled", "decline", "waiting"]
            },
            cancelReason: {
                type: String
            }
        }
    ],
    cancelReason: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    id: false,
    collection: 'requests',
    toJSON: {
        getters: true,
        virtuals: true
    },
    toObject: {
        getters: true,
        virtuals: true
    }
});

module.exports.Request = mongoose.model('Request', RequestSchema);
