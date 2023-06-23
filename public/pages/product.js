$(function () {

  //------------------------- Pairing With -------------------------//
  let $pairingTemplate = $("#pairing-template");
  let $pairings = $("#pairing-food");
  let $addPairBtn = $("#add-pair-food");
  let tcount = $pairings.children().length;
  let pName = 0;
  let pairLimit = $('input[name="pairLimit"]').val();

  function addTraining() {
    let removeBtn = "";
    if (tcount > 0) {
      removeBtn =
        ' <div class="delete-item float-right col-lg-12"><button type="button" class="btn btn-danger"><i class="fa fa-trash-o text-light"></i></button></div>';
    }
    let $clone = $pairingTemplate
      .clone()
      .removeClass("hide")
      .attr("id", "training" + tcount)
      .appendTo($pairings);

    //drop zone code starts here

    Dropzone.autoDiscover = false;
    $clone
      .find("#pairPrDropzone")
      .attr("id", "pairPrDropzone_" + tcount)
      .addClass("dropZoneUpload")
      .attr("data-saveTo", "pairImg_" + tcount)
      .end()

      .find("#pairImg")
      .attr("id", "pairImg_" + tcount)
      .find('[name="pairImg"]')
      .attr("name", "pairImg[" + tcount + "][pairImg]")
      .end();

    let elm = $("#pairPrDropzone_" + tcount);
    const uploadedObjects = $(elm).attr("data-uploaded")
      ? JSON.parse($(elm).attr("data-uploaded"))
      : {};

    $("#pairPrDropzone_" + tcount).dropzone({
      paramName: "image",
      url: `/upload/add?type=product`,
      uploadMultiple: 2,
      maxFiles: 2,
      maxFilesize: 1,
      acceptedFiles: "image/*",
      parallelUploads: 1,
      addRemoveLinks: true,
      init: function () {
        const addFiles = (mockFile) => {
          elm.emit("addedfile", mockFile);
          elm.emit("thumbnail", mockFile, mockFile.thumb);
          mockFile.previewElement.classList.add("dz-success");
          mockFile.previewElement.classList.add("uploadedImg");
          mockFile.previewElement.classList.add("dz-complete");
          $(mockFile.previewElement)
            .find(".dz-image")
            .children("img")
            .addClass("image-preview");
          elm.emit("complete", mockFile);

          elm.options.maxFiles > 0 &&
            (elm.options.maxFiles = elm.options.maxFiles - 1);
          elm
            .children()
            .last()
            .find(".dz-remove")
            .attr("href", "javascript: void(0);")
            .addClass(removeClass);
        };
        this.on("processing", function (file) {
          showLoader();
        });
        this.on("success", function (file, responseText) {
          if (responseText.success) {
            let mediaName = "";
            elm.siblings(".text-danger").hide();
            elm.children(".needsclick").hide();
            const thisRes = $(`#${elm.attr("data-saveTo")}`);
            if (`${thisRes.val().length}` > 0) {
              mediaName = `${thisRes.val()},${responseText.data}`;
            } else {
              mediaName = `${thisRes.val()}${responseText.data}`;
            }
            let urls = mediaName.split(",");
            urls = urls
              .filter((item, i, ar) => ar.indexOf(item) === i)
              .join(",");
            thisRes.val(urls);

            // Code for thumb
            const tempUrlArr = urls.split(",").filter((i) => i);
            file.key = tempUrlArr[tempUrlArr.length - 1];
            file.thumb = `${window.s3Base}${tempUrlArr[tempUrlArr.length - 1]}`;
            $.loadingBlockHide({});
          }
        });
        this.on("error", function (file, res) {
          if (res.message) {
            res = res.message;
          }
          let $apiMessage = elm.children("[data-msg-id]").attr("data-msg-id");
          $($apiMessage)
            .html(
              `<div class="alert alert-danger alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>${res}</div>`
            )
            .parents("div.row")
            .show();
          $("html, body").animate(
            {
              scrollTop: $($apiMessage).offset().top - 100,
            },
            200
          );
          $.loadingBlockHide({});
        });

        this.on("removedfile", async (file) => {
          elm.children(".needsclick").hide();
          if (file.key) {
            const $thisRes = $(`#${elm.attr("data-saveTo")}`);
            var uploadedFile = $thisRes.val().split(",");
            const url = `/upload/delete`;
            const data = {
              ...uploadedObjects.data,
              key: file.key,
            };
            const result = await requester(
              url,
              data,
              uploadedObjects.type,
              uploadedObjects.dataType,
              elm.children("[data-msg-id]").attr("data-msg-id")
            );

            if (result) {
              const $thisRes = $(`#${elm.attr("data-saveTo")}`);
              let urls = $thisRes
                .val()
                .split(",")
                .filter((i) => i);
              delete urls[urls.indexOf(file.key)];
              urls = urls.filter((i) => i).join(",");
              $thisRes.val(urls ? `${urls},` : "");
            } else {
              addFiles(file);
            }
            if (!elm.children(".dz-preview").length) {
              elm.children(".needsclick").show();
              elm.siblings(".text-danger").show();
            }
            if (result && uploadedFile) {
              var index = uploadedFile.indexOf(file.key);
              if (index != -1) {
                uploadedFile.splice(index, 1);
                $thisRes.val(uploadedFile);
              }
            }
          } else if (!file.key && !elm.children(".dz-preview").length) {
            elm.children(".needsclick").show();
            elm.siblings(".text-danger").show();
          }
        });
        uploadedObjects.objects &&
          uploadedObjects.objects.forEach((mockFile) => addFiles(mockFile));
      },
    });

    $($clone).prepend(removeBtn);

    $clone
      .find('[name="name"]')
      .attr("name", "pairFood[" + pName + "][name]")
      .end()

      .find('[name="pairImg"]')
      .attr("name", "pairFood[" + pName + "][pairImg]")
      .end()

      .find(".pairImg")
      .removeClass("pairImg")
      .addClass("pairImg_" + pName)

      .find('[name="pairImg"]')
      .attr("name", "pairFood[" + pName + "][pairImg]")
      .attr("id", "pairImg" + pName)
      .end();

    tcount++;
    pName++;
  }

  $addPairBtn.on("click", function () {
    $(this).next(".pairLimitErr").html("");
    if (tcount >= pairLimit) {
      $(this)
        .next(".pairLimitErr")
        .html("<p>Cannot add more than " + pairLimit + " pairing products</p>");
    } else {
      addTraining();
    }
  });

  if (tcount == 0) {
    addTraining();
  }

  $pairings.on("click", ".delete-item", function () {
    $(".pairLimitErr").html("");
    let shouldRemove = confirm("Are you sure ?");
    if (shouldRemove) {
      $(this).closest(".pairFood").remove();

      tcount--;
      if (tcount == 0) {
        addTraining();
      }
    }
  });

  //------------------------- Ingredients With -------------------------//
  let $ingredientsTemplate = $("#ingredients-template");
  let $ingredients = $("#ingredients-food");
  let $addIngredientsBtn = $("#add-ingredients");
  let icount = $ingredients.children().length;
  let iName = 0;
  let ingLimit = $('input[name="ingredientsLimit"]').val();

  function addIngredient() {
    let removeBtn = "";
    if (icount > 0) {
      removeBtn =
        ' <div class="delete-item float-right col-lg-12"><button type="button" class="btn btn-danger"><i class="fa fa-trash-o text-light"></i></button></div>';
    }
    let $clone = $ingredientsTemplate
      .clone()
      .removeClass("hide")
      .attr("id", "training" + icount)
      .appendTo($ingredients);

    $($clone).prepend(removeBtn);

    $clone
      .find('[name="ingColor"]')
      .attr("name", "ingredientsAdd[" + iName + "][color]")
      .addClass('ingColor' + iName)
      .end()

      .find('[name="ingName"]')
      .attr("name", "ingredientsAdd[" + iName + "][name]")
      .addClass("ingName" + iName)
      .end()

      .find('[name="percent"]')
      .attr("name", "ingredientsAdd[" + iName + "][percent]")
      .end();

    // $(".ingColor" + iName).select2();
    // $(".ingName" + iName).select2();
    
    icount++;
    iName++;
  }

  $addIngredientsBtn.on("click", function () {
    $(this).next(".ingredientLimitErr").html("");
    if (icount >= ingLimit) {
      $(this)
        .next(".ingredientLimitErr")
        .html("<p>Cannot add more than " + ingLimit + " pairing products</p>");
    } else {
      addIngredient();
    }
  });

  if (icount == 0) {
    addIngredient();
  }

  $ingredients.on("click", ".delete-item", function () {
    $(".ingredientLimitErr").html("");
    let shouldRemove = confirm("Are you sure ?");
    if (shouldRemove) {
      $(this).closest(".ingredientsAdd").remove();

      icount--;
      if (icount == 0) {
        addIngredient();
      }
    }
  });
});
