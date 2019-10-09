/* global initInlineEditing PerfectScrollbar */
/* eslint-disable no-restricted-globals, no-alert */
var inlineSteps = (function() {

  function initTinyMCE() {
    $('.inline-step .step-description .tinymce-view').click(function() {
      console.log($(this).closest('textarea'))
      TinyMCE.init(`#${$(this).next().find('textarea').attr('id')}`);
    })
  }

  return {
    init: () => {
      if ($('.inline-step').length > 0) {
        initTinyMCE()
      }
    },
  };
}());

$(document).on('turbolinks:load', function() {
  inlineSteps.init();
});
