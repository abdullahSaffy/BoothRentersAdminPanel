
$(function () {
    //---------------Delete confirmation box---------------------//
    $(document).on("click", ".deleteItem", function (e) {
        e.preventDefault();
        let url = $(this).attr("href");
        bootbox.confirm("Are you sure want to delete?", function (result) {
            if (result == true) {
                window.location.href = url;
            }
        });
    });

    //--------bootbox confirmation model----------------//
    $("body").on("click", ".tblStatus", function (e) {
        e.preventDefault();
        let statusChangeUrl = $(this).attr("data-url");
        let url = statusChangeUrl;
        let id = $(this).attr("data-id");
        bootbox.confirm("Do you really want this?", function (result) {
            if (result == true) {
                $.ajax({
                    method: "GET",
                    url: statusChangeUrl,
                    success: function (data) {

                        if (data.userInactiveCheck != undefined && data.userInactiveCheck == true) {
                            $.Notification.autoHideNotify(
                                "error",
                                "t r",
                                "Unable to update the status",
                                data.msg
                            );
                        } else {
                            if (data.status == true) {
                                let status = (data.label) ? data.label : "Active";
                                url = url.split('/').slice(0, -1).join('/') + '/0'
                                let htmlData =
                                    '<label data-id="' +
                                    id +
                                    '" class="badge badge-success tblStatus" data-url="' +
                                    url +
                                    '">' + status + '</label>';
                                $("#" + id).html(htmlData);
                                $.Notification.autoHideNotify(
                                    "success",
                                    "t r",
                                    (data.caption) ? data.caption : "Status Changed",
                                    data.msg
                                );
                            } else {
                                let status = (data.label) ? data.label : "Inactive";

                                url = url.split('/').slice(0, -1).join('/') + '/1'
                                let htmlData =
                                    '<label data-id="' +
                                    id +
                                    '" class="badge badge-danger tblStatus" data-url="' +
                                    url +
                                    '">' + status + '</label>';
                                $("#" + id).html(htmlData);
                                $.Notification.autoHideNotify(
                                    "success",
                                    "t r",
                                    (data.caption) ? data.caption : "Status Changed",
                                    data.msg
                                );
                            }
                        }
                    }
                });
            }
        });
    });

    //-------------SummerNote Configuration-------------------------//
    $(".summernote").summernote({
        height: 250,
        minHeight: null,
        maxHeight: null,
        focus: false,
        styleWithSpan: false,
        toolbar: [
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['font', ['strikethrough', 'superscript', 'subscript']],
            ['fontsize', ['fontsize']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['height', ['height']]
        ]
    });

    $(".note-editable").on('keypress paste', function (e) {
        let kc = e.charCode;
        const caracteres = $(this).text();
        const totalCaracteres = caracteres.length;
        maxChar = parseInt($(this).parent().closest('.note-editor').prev('textarea').attr('max-char'));
        if (kc === 32 && totalCaracteres == 0) {
            e.preventDefault();
            return false;
        }
    });

});