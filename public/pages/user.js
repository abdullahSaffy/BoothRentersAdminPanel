$(function () {
  let headerUrl = window.location.href;
  headerUrl = headerUrl.split("/");
  headerUrl = headerUrl[headerUrl.length - 2];

  $("#add-user, #edit-user").validate({
    errorPlacement: function (error, element) {
      const name = $(element).attr("name");
      error.appendTo($("." + name));
    },
    submitHandler: async function (form, event) {
      event.preventDefault();
      $(form).find(":submit").prop("disabled", "disabled");
      await submitForm(form, window.location.href, "POST", "/" + headerUrl);
    },
    rules: {
      fullName: {
        required: {
          depends: function () {
            $(this).val($(this).val().trimStart());
            return true;
          },
        },
        minlength: 3,
        maxlength: 300,
      },
      gender: {
        required: true,
      },
      email: {
        email: true,
        minlength: 3,
        maxlength: 300,
      },
      mobile: {
        minlength: 10,
        maxlength: 10,
        required: true,
      },
      profilePicture: {
        required: true,
      },
    },
    messages: {},
    ignore: "",
  });
});
