var StepAssets = (function() {
  var stepContainer = '.steps-container';

  function initDirectUpload() {
    $(stepContainer).off('change click', '.upload-file-button .file-field')
      .on('change', '.upload-file-button .file-field', function() {
        file = this.files[0]
        uploadButton = $(this).closest('.upload-file-button')
        uploadUrl = uploadButton.data('direct-upload-url')
        createUrl = uploadButton.data('create-url')
        let upload = new ActiveStorage.DirectUpload(file, uploadUrl);
        upload.create(function(error, blob) {
          if (error) {
            // Handle the error
          } else {
            $.post(createUrl, {blob_id: blob.signed_id}, function(result) {
              console.log(1)
              var newAsset = $(result.html);
              var assetContainer = uploadButton.closest('.step-assets').find('.attachments')
              newAsset.find('.file-preview-link').css('top', '-300px');
              newAsset.addClass('new').prependTo(assetContainer);
              setTimeout(function() {
                newAsset.find('.file-preview-link').css('top', '0px');
              }, 200);                                    
            })
          }
        });
      })
      .on('click', '.upload-file-button .file-field', function(e) {
        e.stopPropagation()
      })
  }

  function initUploadButton() {
    $(stepContainer).off('click', '.upload-file-button')
      .on('click', '.upload-file-button', function() {
        $(this).find('.file-field').click()
      })
  }

  return {
    init: () => {
      initDirectUpload()
      initUploadButton()
    }
  };
}());