var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Setting Schema
 */
var SettingSchema = new Schema({
  
  ios_force_update: {
    type: Boolean,
    default: false
  },
  ios_version: {
    type: String
  },
  ios_link: {
    type: String
  },

  ios_force_update_barber: {
    type: Boolean,
    default: false
  },
  ios_version_barber: {
    type: String
  },
  ios_link_barber: {
    type: String
  },

  maintenance_mode: {
    type: Boolean,
    default: false
  },
  android_force_update: {
    type: Boolean,
    default: false
  },
  android_version: {
    type: String
  },
  android_link: {
    type: String
  },
  android_force_update_barber: {
    type: Boolean,
    default: false
  },
  android_version_barber: {
    type: String
  },
  android_link_barber: {
    type: String
  },
  maintenance_mode_barber:{
    type: Boolean,
    default: false
  },
  // android_maintenance_mode: {
  //   type: Boolean,
  //   default: false
  // },
  status: {
    type: Boolean,
    default: true
  },
  admin_charge: {
    type: Number, 
    default: 10
  }
 }, {
    timestamps: {
      createdAt: 'created',
      updatedAt: 'updated'
    },
    id: false,
    toJSON: {
      getters: true,
      virtuals: true
    },
    toObject: {
      getters: true,
      virtuals: true
    }
  });

module.exports.Setting = mongoose.model('Setting', SettingSchema);