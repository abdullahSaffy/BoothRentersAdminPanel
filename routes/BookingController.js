const express = require('express');
const router = express.Router();
const User = require("../models/User").User,
    Report = require("../models/Report").Report,
    Shop = require("../models/Shop").Shop,
    Request = require("../models/Request").Request,
    Appointment = require("../models/Appointment").Appointment;
const UploadConfig = require("../lib/upload");


/** Booking List Screen */
router.get('/', FUNC.Auth, async function (req, res) {
    res.render("booking/index", {
        title: "Booking Manager",
        s3BaseUrl: process.env.S3_URL,
        clearUrl: "/booking"
    })
});

/** All Booking List */
router.get('/list', FUNC.Auth, async function (req, res) {
    let params = _.extend(req.query || {}, req.params || {}, req.body || {});
    params.search = params.search.value;
    params.columnNo = (params.order) ? parseInt(params.order[0].column) : "";
    params.sortOrder = (params.order) ? params.order[0].dir === 'desc' ? -1 : 1 : -1;

    let userData = await getBookingList(params);
    let temp = [];
    let skip = parseInt(params.start);
    async.eachSeries(userData.data, function (booking, loop) {

        //status work for shop
        // let shopBadgeStatus = (user.shopStatus == true) ? " badge-success" : " badge-danger";
        // let shopBadgeLabel = (user.shopStatus == true) ? "Accept" : "decline";
        // let statusShop = (user.shopStatus == true) ? 0 : 1;
        // let statusHtmlShop = '<span id="tblStatus' + user._id + '"><label data-id="tblStatus' + user._id + '" class="badge ' + shopBadgeStatus + ' tblStatus" data-url="' + process.env.SITE_URL + 'user/confirmShop/' + user._id + '/' + statusShop + '">' + shopBadgeLabel + '</label></span>';
        //end status work for shop
      
        //status work for shop
        let statusHtml = "N/A";
        if(booking.shop){
            
        let badgeStatus;
        if(booking.status == "not-started" || "arrived" || "ongoing" || "completed"){
            badgeStatus = " badge-success"
        }
        else{
            badgeStatus =  " badge-danger"
        }
         let badgeLabel = booking.status;

        let status = (booking.status == true) ? 0 : 1;
         statusHtml = '<span><label class="badge" data-url="' + process.env.SITE_URL + 'barber/update_status/' + booking.shop._id + '/' + status + '">' + badgeLabel + '</label></span>'
        }
        let date = moment(booking.startDate * 1000).format("DD-MM-YYYY");
        
        temp.push({
            0: (skip += 1),
            1: booking.reqId,
            2: booking.userData && booking.userData.fullName ? booking.userData.fullName: "N/A",
            3: booking.barberData && booking.barberData.fullName ? booking.barberData.fullName: "N/A",
            4: date,
            5: booking.amount,
            6: booking.createdAt,
            7: statusHtml,
            8: `<a href = "/booking/view/${booking._id}""> <i class="fa fa-eye"></i></a >`
        });
        loop();
    }, function (asyncErr, asyncRes) {
        return res.send({
            draw: parseInt(req.query.draw),
            recordsFiltered: userData.totalRecords,
            recordsTotal: userData.totalRecords,
            data: temp,
        });
    });
});

/** get Booking list function */
async function getBookingList(reqData) {
    //paging
    let skip = parseInt(reqData.start);
    let limit = parseInt(reqData.length);
    let totalRecords = 0;
    //search    
    let searchQry = {
        status: { $ne: "canceled" },
    };
    let searchQryUser = {};
    if (reqData.search) {
        searchQry = {
            ...searchQry,
            $or: [
                { reqId: { $regex: reqData.search, $options: 'i' } },
                { status: { $regex: `.*\\${reqData.search}.*`, $options: 'i' } }
            ],
        }
    }

  //sorting
  let sortQry = {};
  switch (reqData.columnNo) {
    case 1:
      sortQry = { reqId: reqData.sortOrder };
      break;
    default:
      sortQry = { createdAt: reqData.sortOrder };
  }

    if (reqData.bookingDateRange) {
        let dateR = reqData.bookingDateRange.split('to');
        var startDate = new Date(new Date(dateR[0]).setDate(new Date(dateR[0]).getDate() + 1));
        var endDate = new Date(new Date(dateR[1]).setDate(new Date(dateR[1]).getDate() + 1));
        searchQry = {
            ...searchQry,
            createdAt: { $gte:startDate, $lte:endDate}
        }
    }

    if(reqData.custName){
        searchQryUser = {
            ...searchQryUser,
            "userData.fullName": { $regex: reqData.custName, $options: 'i' }
        }
    }

    if(reqData.barberName){
        searchQryUser = {
            ...searchQryUser,
            "barberData.fullName": { $regex: reqData.barberName, $options: 'i' }
        }
    }

    if(reqData.bookingStatus){
        searchQry = {
            ...searchQry,
            status: { $regex: reqData.bookingStatus, $options: 'i' }
        }
    }

    let data;
    let aggQry = [
        {
            $match: searchQry
        },
        {
            $lookup: { 
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "userData"
            }
        },
        {
            $unwind:
              {
                path: "$userData",
                preserveNullAndEmptyArrays: true
              }
        },
        {
            $lookup: { 
                from: "users",
                localField: "barber",
                foreignField: "_id",
                as: "barberData"
            }
        },
        {
            $unwind:
              {
                path: "$barberData",
                preserveNullAndEmptyArrays: true
              }
        },
        {
            $match:searchQryUser
        },
    ];

    if(reqData.addressCoordinates){
        let myLocation = reqData.addressCoordinates.split(",");
        aggQry.reverse();
        aggQry.pop();
        let geoNear = {
            $geoNear: {
               near: { type: "Point", coordinates: [ parseFloat(myLocation[0]), parseFloat(myLocation[1])] },
               distanceField: "dist.calculated",
               maxDistance: 10,
               query: searchQry,
               includeLocs: "dist.location",
               spherical: true
            }
        };
        aggQry.push(geoNear);
        aggQry.reverse();
    }

    aggQry.push({ $group: { _id: null, count: { $sum: 1 } } });
    totalRecords = await Appointment.aggregate(aggQry);
    totalRecords = totalRecords[0] != undefined ? totalRecords[0].count : 0;
    aggQry.pop();
    aggQry.push(
        {
          $sort: sortQry,
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        }
      );
    
          data = await Appointment.aggregate(aggQry);

    // let data = await Appointment.find(searchQry)
    //     .populate('user', 'name fullName mobile status')
    //     .sort([[sortField, reqData.sortOrder]])
    //     .skip(skip)
    //     .limit(limit);

    return { data: data, totalRecords: totalRecords };
}

/** User account active/inactive */
router.get("/update_status/:id/:status", FUNC.Auth, async function (req, res) {
    try {
        let params = _.extend(req.query || {}, req.params || {}, req.body || {});
        let updt = { status: params.status };
        if (params.status == 0) {
            updt = {
                ...updt,
                iat: 0
            }
        }
        await Shop.updateOne(
            {
                _id: params.id
            },
            {
                $set: updt
            }
        );

        // update total active user count
        Report.updateOne({}, {
            $inc: {
                activeShop: (params.status == 0) ? -1 : 1
            }
        }).exec();

        return res.json({
            status: (params.status == 0)
                ? false : true,
        });
    } catch (e) {
        req.flash('error', DM.SOMETHING_WRONG);
        return res.redirect(req.header('referer'));
    }
});

/** User Shop active/inactive */
router.get("/confirmShop/:id/:status", FUNC.Auth, async function (req, res) {
    try {
        let params = _.extend(req.query || {}, req.params || {}, req.body || {});

        await User.updateOne(
            {
                _id: params.id
            },
            {
                $set: { shopStatus: true }
            }
        );

        // update total active user count
        // Report.updateOne({}, {
        //     $inc: {
        //         activeUser: (params.status == 0) ? -1 : 1
        //     }
        // }).exec();

        return res.json({
            status: (params.status == 0)
                ? false : true,
        });
    } catch (e) {
        req.flash('error', DM.SOMETHING_WRONG);
        return res.redirect(req.header('referer'));
    }
});
/** Edit user screen */
router.get('/view/:id', FUNC.Auth, async function (req, res) {

    let params = _.extend(req.query || {}, req.params || {}, req.body || {});
    let booking = await Appointment.findById(
        {
            _id: params.id,
            status: { $ne: "canceled" }
        }
    ).populate('user').populate('shop').lean();
    if (!booking) {
        req.flash('error', DM.BOOKING_NOT_EXIST);
        return res.redirect(req.header('referer'));
    }
    let shopLogo = "";

    console.log('booking--------------------------------------------->',booking);
    if(booking.shop && booking.shop.thumbImg){
        shopLogo = process.env.S3_URL + booking.shop.thumbImg
    }

    return res.render('booking/view', {
        title: "View Booking",
        booking,
        shopLogo: shopLogo,
        siteUrl : process.env.SITE_URL + 'barber/view/',
        S3URL : process.env.S3_URL
    });
});


module.exports = router;
