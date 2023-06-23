$(function () {
    let today = new Date();
    let startVal = $("[name='startDateVal']").val();
    let endVal = $("[name='endDateVal']").val();

    let uStartDate = new Date(startVal * 1000);
    let uEndDate = new Date(endVal * 1000);
    uEndDate.setDate(uEndDate.getDate() - 1);
    uEndDate.setHours(23);
    uEndDate.setUTCMinutes(59);
    uEndDate.setUTCSeconds(59);

    $('.startDateTime').flatpickr({
        dateFormat: "Y-m-d",
        minDate: (startVal) ? uStartDate : today,
        defaultDate: (startVal) ? uStartDate : today,
    });

    $('.endDateTime').flatpickr({
        dateFormat: "Y-m-d",
        minDate: (startVal) ? uStartDate : today,
        defaultDate: (endVal) ? uEndDate : today,
    });

    $(".startDateTime").on("change", function (e) {
        let min = $(this).val();
        let endDate = $(".endDateTime");

        if ($(endDate).val() < min) {
            $(endDate).val("");
        }

        let minEndDate = Date.parse(min);
        $(endDate).flatpickr({
            dateFormat: "Y-m-d",
            minDate: new Date(minEndDate)
        });
    });

    $(".daterange").flatpickr({
        mode: "range",
        dateFormat: "Y-m-d",
        defaultDate: ''
    })
})
