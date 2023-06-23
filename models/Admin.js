const mongoose = require('mongoose'),
    Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

var AdminSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
    },
    name: {
        type: String,
        trim: true
    },
    otp: {
        type: String,
    },
    otpExp: {
        type: Number,
    },
    profileImg: {
        type: String,
        trim: true
    },
    changePasswordTime: {
        type: Number,
        default: 0
    },
    otpVerify: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    id: false,
    collection: 'admin',
    toJSON: {
        getters: true,
        virtuals: true
    },
    toObject: {
        getters: true,
        virtuals: true
    }
});

AdminSchema.methods.comparePassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (e) {
        return false;
    }
};

AdminSchema.pre('save', async function (next) {
    const admin = this;
    try {
        if (admin.password) {
            const saltRounds = parseInt(process.env.BCRYPT_ITERATIONS, process.env.BCRYPT_ITERATIONS) || 10;
            admin.password = await bcrypt.hash(admin.password, saltRounds);
            next();
        }
        else {
            next();
        }
    } catch (e) {
        next(e);
    }
});

module.exports.Admin = mongoose.model('Admin', AdminSchema);
