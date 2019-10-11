/* global initInlineEditing PerfectScrollbar */
/* eslint-disable no-restricted-globals, no-alert */
var inlineSteps = (function() {
  var stepContainer = '.steps-container';

  function initTinyMCE() {
    $(stepContainer).on('click', '.step-description .tinymce-view', function() {
      TinyMCE.init(`#${$(this).next().find('textarea').attr('id')}`);
    })
  }

  function initChecklists() {
    function updateOrder(checklistContainer) {
      var order = [];
      checklistContainer.find('.checklist').each(function(){ order.push(this.dataset.checklistId); });
      $.post(checklistContainer.data('reorder-url'), {checklists: order})
    }

    $(stepContainer).on('click', '.checklist-actions .fa-arrow-up', function() {
      var previousChecklist = $(this).closest('.checklist').prev();
      $(this).closest('.checklist').detach().insertBefore(previousChecklist);
      updateOrder($(this).closest('.step-checklists'));
    })

    $(stepContainer).on('click', '.checklist-actions .fa-arrow-down', function() {
      var previousChecklist = $(this).closest('.checklist').next();
      $(this).closest('.checklist').detach().insertAfter(previousChecklist);
      updateOrder($(this).closest('.step-checklists'));
    })

    $(stepContainer).on('click', '.checklist-actions .fas.edit-switcher', function() {
      var checklist = $(this).closest('.checklist');
      var checklistItems = checklist.find('.checklist-items');
      checklist.toggleClass('edit-mode')
      if (checklist.hasClass('edit-mode')) {
        checklistItems.sortable({
          handle: ".fa-grip-horizontal",
          stop: () => {
            var order = [];
            checklist.find('.checklist-item').each(function(){ order.push(this.dataset.checklistItemId); });
            $.post(checklist.data('checklist-reorder-url'), {checklist_items: order})
          }
        });
        checklistItems.sortable('enable');
      } else {
        checklistItems.sortable('disable');
      }
    })
  }

  return {
    init: () => {
      if ($('.steps-container').length) {
        initTinyMCE()
        initChecklists() 
      }
    },
  };
}());

$(document).on('turbolinks:load', function() {
  inlineSteps.init();
});
