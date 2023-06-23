const mongoose = require('mongoose'),
    Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

var ShopSchema = new Schema({
    barber:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    thumbImg:{
        type: String
    },
    name:{
        type: String,
        trim: true
    },
    experience:{
        type: String
    },
    description:{
        type: String,
        trim: true
    },
    location: {
        type: [Number],
        default: [75.7713, 26.8922],
        index: '2dsphere'
      }, 
    address:{
        type: String,
        trim: true
    }, 
    googleAddress:{
        type: String,
        trim: true
    },
    zipcode:{
        type: Number,
    },
    ProfileCompleted:{
        type: Boolean,
        default: false        
    },
    portfolio:[
        {
            image: {type: String},
            name: {type: String, trim: true}
        }
    ],
    availability:[
        {
            day: {type: String},
            startTime: {type: String, trim: true},
            endTime: {type: String, trim: true},
        }
    ],
    about:{
        type: String,
        trim: true
    },
    avgRating:{
        type: Number
    },
    status:{
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true,
    id: false,
    collection: 'shops',
    toJSON: {
        getters: true,
        virtuals: true
    },
    toObject: {
        getters: true,
        virtuals: true
    }
});

module.exports.Shop = mongoose.model('Shop', ShopSchema);
