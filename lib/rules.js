let Joi = require("joi");
const patterns = {
  email:
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  password: /^(?=(.*[a-zA-Z])+)(?=(.*[0-9])+).{8,}$/,
};

const maxName = 50;
const descChar = 1000;
const qChar = 200;
const shortDesc = 200;
const sliderDesc = 500;
const tastingNote = 200;
const history = 500;

const logIn = Joi.object().keys({
  email: Joi.string()
    .trim()
    .lowercase()
    .regex(patterns.email, "emailPattern")
    .required(),
  password: Joi.string().required(),
});

const forgotPassword = Joi.object().keys({
  email: Joi.string()
    .trim()
    .lowercase()
    .regex(patterns.email, "emailPattern")
    .required(),
});

const resetPassword = Joi.object().keys({
  password: Joi.string()
    .max(72)
    .regex(patterns.password, "passwordPattern")
    .required()
    .error(
      new Error(
        "Password must contain 8 characters with combination of special Symbol and Capital letters and digits."
      )
    ),
  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref("password"))
    .error(new Error("Password should be match")),
});

const addUser = Joi.object().keys({
  fullName: Joi.string().trim().required().min(3).max(maxName),
  email: Joi.string()
    .trim()
    .optional()
    .allow("")
    .regex(patterns.email, "emailPattern")
    .min(3)
    .max(300),
  gender: Joi.string().trim().required(),
  mobile: Joi.number().required(),
  profilePicture: Joi.required(),
});

const otpVerify = Joi.object().keys({
  otp: Joi.number().required(),
});

const addSetting = Joi.object().keys({
  _id: Joi.any(),
  ios_version: Joi.string().trim().required(),
  ios_link: Joi.string().trim().required(),
  maintenance_mode: Joi.number(),
  ios_force_update: Joi.number(),
  android_version: Joi.string().trim().required(),
  android_link: Joi.string().trim().required(),
  android_force_update: Joi.number(),
  admin_charge: Joi.number().integer(),
  ios_version_barber: Joi.string().trim().required(),
  ios_link_barber: Joi.string().trim().required(),
  ios_force_update_barber: Joi.number(),
  android_version_barber: Joi.string().trim().required(),
  android_link_barber: Joi.string().trim().required(),
  android_force_update_barber: Joi.number(),
});

const addPage = Joi.object().keys({
  description: Joi.string().trim().invalid("<p><br></p>").min(1).required(),
  slug: Joi.string().required(),
});

const addAddress = Joi.object().keys({
  address: Joi.string().required(),
});

module.exports = {
  logIn,
  forgotPassword,
  resetPassword,
  addUser,
  otpVerify,
  addSetting,
  addPage,
  addAddress
};
