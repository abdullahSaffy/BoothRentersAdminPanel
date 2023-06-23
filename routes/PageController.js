const express = require('express');
const router = express.Router();
const Page = require("../models/Page").Page;


/** All Page Screen */
router.get('/', FUNC.Auth, async function (req, res) {

    res.render("page/index", {
        title: "All Pages",
    })
});


/** All Page List */
router.get('/list', FUNC.Auth, async function (req, res) {
    let params = _.extend(req.query || {}, req.params || {}, req.body || {});
    params.search = params.search.value;
    params.columnNo = (params.order) ? parseInt(params.order[0].column) : "";
    params.sortOrder = (params.order) ? params.order[0].dir === 'desc' ? -1 : 1 : -1;

    //paging
    let skip = parseInt(params.start);
    let limit = parseInt(params.length);

    //search    
    let searchQry = {};
    if (params.search) {
        searchQry = {
            ...searchQry,
            $or: [
                { title: { $regex: params.search, $options: 'i' } },
            ]
        }
    }

    //sorting
    let sortField = {};
    switch (params.columnNo) {
        case 2:
            sortField = "createdAt"
            break;
        case 1:
            sortField = "title"
            break;
    }


    let totalRecords = await Page.countDocuments(searchQry);

    let pageData = await Page.find(searchQry)
        .sort([[sortField, params.sortOrder]])
        .skip(skip)
        .limit(limit);

    let temp = [];
    async.eachSeries(pageData, function (page, loop) {

        temp.push({
            0: (skip += 1),
            1: page.title,
            2: FUNC.showDateFromString(page.createdAt, 'MMM DD YYYY HH:mm'),
            3: `<a href="/content/edit/${page._id}"title="Edit"><i class="fa fa-edit"></i></a>`
        });
        loop();
    }, function (asyncErr, asyncRes) {
        return res.send({
            draw: parseInt(req.query.draw),
            recordsFiltered: totalRecords,
            recordsTotal: totalRecords,
            data: temp,
        });
    });
});

/** Edit Page screen */
router.get('/edit/:id', FUNC.Auth, async function (req, res) {
    let params = _.extend(req.query || {}, req.params || {}, req.body || {});

    let page = await Page.findOne({
        _id: params.id,
    });

    if (!page) {
        req.flash('error', DM.PAGE_NOT_EXIST);
        return res.redirect(req.header('referer'));
    }
    return res.render('page/edit', {
        title: "Edit Page",
        page,
    });
});


/** Edit page */
router.put('/edit/:id', FUNC.Auth, FUNC.validate(validation.addPage, true), async function (req, res) {
    try {
        let params = _.extend(req.query || {}, req.params || {}, req.body || {});
        await Page.updateOne(
            {
                _id: params.id
            },
            {
                $set: {
                    ...params,
                    desc:params.description
                }
            },
        );

        req.flash('success', DM.PAGE_UPDATE_SUCCESS);
        return res.success({})
    } catch (e) {
        return res.serverError({}, DM.SOMETHING_WRONG);
    }
});

module.exports = router;