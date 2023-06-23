const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PaymentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    barber:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    shop: {
        type: Schema.Types.ObjectId,
        ref: "Shop"
    },
    reqId:{
        type: String,
        trim: true
    },
    amount: {
        type: String,
        trim: true
    },
    paymentIntentId:{
        type: String,
        trim: true
    },
    paymentStatus: {
        type: String,
        trim: true
    },
    paymentType: {
        type: String,
        trim: true
    },
    paymentTime:{
        type: Number,
    },
    chargeResponse:{
        type: Object
    }
}, {
    timestamps: true,
    id: false,
    collection: 'payments',
    toJSON: {
        getters: true,
        virtuals: true
    },
    toObject: {
        getters: true,
        virtuals: true
    },
});


PaymentSchema.statics.getMessage = function (
    nType,
    lang,
    data = {}
) {
    let replaceData = {};
    switch (nType) {
        case "NEW_QUOTATION":
            replaceData = {
                body: {
                    reqId: data.reqId,
                },
                title: {},
            };
            break;
        default:
            break;
    }
    let messages = {
        NEW_QUOTATION: {
            en: {
                title: "New Quotation",
                body: "New quotation received on %reqId request",
                icon: "notification_icon_white_camera",
                sound: "default",
                channelId: "default",
            }
        },
    }
    let returnMessage = {};
    if (messages.hasOwnProperty(nType)) {
        returnMessage = messages[nType].en;
        if (
            lang &&
            lang != "en" &&
            messages[nType].hasOwnProperty(lang)
        ) {
            returnMessage = messages[nType][lang];
        }
    }

    if (replaceData && replaceData.title && !_.isEmpty(returnMessage)) {
        for (key in replaceData.title) {
            returnMessage.title = returnMessage.title.replace(
                "%" + key,
                replaceData.title[key]
            );
        }
    }
    if (replaceData && replaceData.body && !_.isEmpty(returnMessage)) {
        for (key in replaceData.body) {
            returnMessage.body = returnMessage.body.replace(
                "%" + key,
                replaceData.body[key]
            );
        }
    }
    return returnMessage;
}

module.exports.Payment = mongoose.model('Payment', PaymentSchema);
