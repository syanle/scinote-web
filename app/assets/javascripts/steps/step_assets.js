var StepAssets = (function() {
  var stepContainer = '.steps-container';

  function initAddAssetsButton() {
    $(stepContainer).off('click', '.step-actions .add-new-items .assets')
      .on('click', '.step-actions .add-new-items .assets', function() {
        $(this).closest('.inline-step').find('.step-assets').removeClass('hidden')
        $(this).addClass('hidden')
      })
  }

  function initDirectUpload() {
    $(stepContainer).off('change click', '.upload-file-button .file-field')
      .on('change', '.upload-file-button .file-field', function() {
        var file = this.files[0]
        var uploadButton = $(this).closest('.upload-file-button')
        var uploadUrl = uploadButton.data('direct-upload-url')
        var createUrl = uploadButton.data('create-url')
        var upload = new ActiveStorage.DirectUpload(file, uploadUrl);
        var errorField = uploadButton.closest('.step-assets').find('.upload-file-error')
        var errorMessage;

        if (checkFileSizeLimit(file)) {
          errorMessage = I18n.t('general.file.size_exceeded',{file_size: GLOBAL_CONSTANTS.FILE_MAX_SIZE_MB})
          errorField.html(errorMessage)
          setTimeout(() => {
            errorField.html('')
          }, 10000)
          return false
        }

        upload.create(function(error, blob) {
          if (error) {
            // Handle the error
          } else {
            $.post(createUrl, {blob_id: blob.signed_id}, function(result) {
              var newAssetContainer = $(result.html);
              var assetContainer = uploadButton.closest('.step-assets').find('.attachments-list')
              newAssetContainer.find('.asset-item').css('top', '-300px');
              newAssetContainer.find('.asset-item').addClass('new');
              newAssetContainer.prependTo(assetContainer);
              setTimeout(function() {
                newAssetContainer.find('.asset-item').css('top', '0px');
              }, 200);  
              FilePreviewModal.init();
              updateAssetCounter(uploadButton.closest('.step-assets'));
              errorField.html('')                                 
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

  function initDragNDropFile() {
    $(window).off('drop dragleave dragover').on('drop dragleave dragover', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      if ((e.type === 'dragleave' && e.fromElement === null) || e.type === 'drop') {
        $(stepContainer).find('.drag-n-drop-zone').css('display', 'none')
      }
    })

    $(stepContainer).off('dragover dragenter drop', '.inline-step')
      .on('dragover dragenter drop', '.inline-step', function(e) {
        if (e.type === 'dragover') {
          $(stepContainer).find('.drag-n-drop-zone').css('display', 'none')
          $(this).find('.drag-n-drop-zone').css('display', 'flex')
        }

        e.preventDefault();
        e.stopPropagation();
      })

    $(stepContainer).off('dragover dragenter drop', '.drag-n-drop-zone')
      .on('dragover dragenter', '.drag-n-drop-zone', function(e) {
        e.preventDefault();
        e.stopPropagation();
      })
      .on('drop', '.drag-n-drop-zone', function(e) {
        console.log(e.originalEvent)
        if(e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files.length) {
            var fileField = $(this).closest('.step-assets').find('.upload-file-button .file-field')
            e.preventDefault();
            e.stopPropagation();
            fileField[0].files = e.originalEvent.dataTransfer.files
            fileField.change()   
        }
        $(stepContainer).find('.drag-n-drop-zone').css('display', 'none')
      })
  }

  function reorderAtachments() {
    $(stepContainer).off('click', '.sort-button .order-type')
      .on('click', '.sort-button .order-type', function() {
        var $this = $(this)
        var labelValue = $this.html()
        var assetsContainer = $this.closest('.step-assets')
        var sortType = $this.data('order')
        var stateUpdateUrl = $this.closest('.sort-attachments-dropdown').data('state-save-path')
        assetsContainer.find('.order-text').html(labelValue)
        assetsContainer.find('.file-preview-link').each(function(){
          var elm = $(this)
          elm.closest('.asset-container').css('order', elm.data('order-' + sortType));
        });
        $.post(stateUpdateUrl,{ assets: { order: sortType } })
      })
  }

  function initDeleteAssetButton() {
    $(stepContainer).off('click', '.asset-item .remove-icon')
      .on('click', '.asset-item .remove-icon', function(e) {
        var asset = $(this).closest('.asset-item');
        var deleteUrl = $(this).data('destroy-url');
        var container = $(this).closest('.step-assets');
        e.stopPropagation();
        e.preventDefault();
        if (confirm('Are you sure you want to delete attachment?')) {
          $.ajax({
            url: deleteUrl,
            type: 'DELETE',
            dataType: 'json',
            success: function(result) {
              asset.parent().remove()
              updateAssetCounter(container)
            }
          });
        }
        
      })
  }

  function updateAssetCounter(container) {
    var assetsCount = container.find('.asset-item').length
    container.find('.attachments-count').html(assetsCount);
  }

  function checkFileSizeLimit(file) {
    return (GLOBAL_CONSTANTS.FILE_MAX_SIZE_MB * 1024 * 1024) < file.size
  }

  return {
    init: () => {
      initAddAssetsButton()
      initDirectUpload()
      initUploadButton()
      initDragNDropFile()
      reorderAtachments()
      initDeleteAssetButton()
    },

    updateAssetCounter: (container) => {
      updateAssetCounter(container)
    }
  };
}());