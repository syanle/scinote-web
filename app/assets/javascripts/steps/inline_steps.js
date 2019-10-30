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

    // Move checklist up
    $(stepContainer).on('click', '.checklist-actions .fa-arrow-up', function() {
      var previousChecklist = $(this).closest('.checklist').prev();
      $(this).closest('.checklist').detach().insertBefore(previousChecklist);
      updateOrder($(this).closest('.step-checklists'));
    })

    // Move checklist down
    $(stepContainer).on('click', '.checklist-actions .fa-arrow-down', function() {
      var previousChecklist = $(this).closest('.checklist').next();
      $(this).closest('.checklist').detach().insertAfter(previousChecklist);
      updateOrder($(this).closest('.step-checklists'));
    })

    // Add checklist
    $(stepContainer).on('click', '.add-item.checklists', function() {
      var checklistContainer = $(this).closest('.inline-step').find('.step-checklists');
      $.post(this.dataset.url, function(result) {
        $(result.html).appendTo(checklistContainer)
      })
    })


    // Delete checklist
    $(stepContainer).on('click', '.checklist-actions .fa-trash', function() {
      var checklist = $(this).closest('.checklist');
      var deleteUrl = checklist.data('checklist-delete-url');
      $.ajax({
        url: deleteUrl,
        type: 'DELETE',
        dataType: 'json',
        success: function(result) {
          checklist.remove()
        }
      });
    })


    // Activate checklist edit mode
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
        checklistItems.find('textarea').focus().blur();
        checklistItems.sortable('enable');
      } else {
        checklistItems.sortable('disable');
      }
    })

    // Checklist item text inline editing
    $(stepContainer).on('change', '.checklist-item .edit-name', function() {
      var checklistItem = $(this).closest('.checklist-item');
      var updateUrl = checklistItem.data('checklist-update-url');
      $.ajax({
        url: updateUrl,
        type: 'PUT',
        dataType: 'json',
        data: {text: this.value},
        success: function(result) {
          checklistItem.find('.view-name').html(result.text);
        }
      });
    })

    // Checklist item state changed
    $(stepContainer).on('change', '.checklist-item .simple-checkbox', function() {
      $.post(this.dataset.updateUrl, {checked: this.checked})
    })

    // Checklist item delete
    $(stepContainer).on('click', '.checklist-item .checklist-delete', function() {
      var checklistItem = $(this).closest('.checklist-item');
      var updateUrl = checklistItem.data('checklist-update-url');
      $.ajax({
        url: updateUrl,
        type: 'DELETE',
        dataType: 'json',
        success: function(result) {
          checklistItem.remove()
        }
      });
    })

    // Checklist item create
    $(stepContainer).on('click', '.new-checklist-item', function() {
      var checklist = $(this).closest('.checklist')
      var createUrl = checklist.data('checklist-create-url');
      var text = $(this).find('.text').html();
      $.post(createUrl, {text: text}, function(result) {
        $(result.html).appendTo(checklist.find('.checklist-items'))
      })
    })


    // Assets
    
  }

  return {
    init: () => {
      if ($('.steps-container').length) {
        initTinyMCE()
        initChecklists()
        StepAssets.init()
      }
    },
  };
}());

$(document).on('turbolinks:load', function() {
  inlineSteps.init();
});
