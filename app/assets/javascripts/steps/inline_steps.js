/* global initInlineEditing PerfectScrollbar */
/* eslint-disable no-restricted-globals, no-alert */
var inlineSteps = (function() {
  var stepContainer = '.steps-container';

  function initStepCreateButton() {
    $('.add-new-step').off().on('click', function() {
      var createUrl = $(this).data('create-url')
      $.post(createUrl, function(result) {
        $(result.html).appendTo(stepContainer)
      })
    })
  }

  function initTinyMCE() {
    $(stepContainer).off('click', '.step-description .tinymce-view')
      .on('click', '.step-description .tinymce-view', function() {
        TinyMCE.init(`#${$(this).next().find('textarea').attr('id')}`);
      })
  }

  function initStepDestroy() {
    $(stepContainer).off('click', '.step-options-items .destroy')
      .on('click', '.step-options-items .destroy', function() {
        var step = $(this).closest('.inline-step')
        var deleteUrl = $(this).data('destroy-url')
        if (confirm("Are you sure you want to delete this step?")) {
          $.ajax({
            url: deleteUrl,
            type: 'DELETE',
            dataType: 'json',
            success: function(result) {
              step.remove()
            }
          });
        }
      })
  }

  function initStepMove() {
    $(stepContainer).off('click', '.inline-step .move-step')
      .on('click', '.inline-step  .move-step', function(e) {
        var button = $(this)
        $.get($(this).data('move-url'), function(data){
          var $step = button.closest(".inline-step");
          var stepUpPosition = data.step_up_position;
          var stepDownPosition = data.step_down_position;
          var $stepDown, $stepUp;
          switch (data.move_direction) {
            case "up":
              $stepDown = $step.prev();
              $stepUp = $step;
              break;
            case "down":
              $stepDown = $step;
              $stepUp = $step.next();
          }
          $stepDown.insertAfter($stepUp);
          $stepDown.find(".step-position").html(stepDownPosition + 1);
          $stepUp.find(".step-position").html(stepUpPosition + 1);
          $("html, body").animate({ scrollTop: $step.offset().top - 150 });
        })
    });
  }

  function initChecklists() {
    function updateOrder(checklistContainer) {
      var order = [];
      checklistContainer.find('.checklist').each(function(){ order.push(this.dataset.checklistId); });
      $.post(checklistContainer.data('reorder-url'), {checklists: order})
    }

    // Move checklist up
    $(stepContainer).off('click', '.checklist-actions .fa-arrow-up')
      .on('click', '.checklist-actions .fa-arrow-up', function() {
        var previousChecklist = $(this).closest('.checklist').prev();
        $(this).closest('.checklist').detach().insertBefore(previousChecklist);
        updateOrder($(this).closest('.step-checklists'));
      })

    // Move checklist down
    $(stepContainer).off('click', '.checklist-actions .fa-arrow-down')
      .on('click', '.checklist-actions .fa-arrow-down', function() {
        var previousChecklist = $(this).closest('.checklist').next();
        $(this).closest('.checklist').detach().insertAfter(previousChecklist);
        updateOrder($(this).closest('.step-checklists'));
      })

    // Add checklist
    $(stepContainer).off('click', '.add-item.checklists')
      .on('click', '.add-item.checklists', function() {
        var checklistContainer = $(this).closest('.inline-step').find('.step-checklists');
        $.post(this.dataset.url, function(result) {
          $(result.html).appendTo(checklistContainer)
        })
      })


    // Delete checklist
    $(stepContainer).off('click', '.checklist-actions .fa-trash')
      .on('click', '.checklist-actions .fa-trash', function() {
        var checklist = $(this).closest('.checklist');
        var deleteUrl = checklist.data('checklist-delete-url');
        if (confirm("Are you sure you want to delete this checklist?")) {
          $.ajax({
            url: deleteUrl,
            type: 'DELETE',
            dataType: 'json',
            success: function(result) {
              checklist.remove()
            }
          });
        }
      })


    // Activate checklist edit mode
    $(stepContainer).off('click', '.checklist-actions .fas.edit-switcher')
      .on('click', '.checklist-actions .fas.edit-switcher', function() {
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
    $(stepContainer).off('change', '.checklist-item .edit-name')
      .on('change', '.checklist-item .edit-name', function() {
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
    $(stepContainer).off('change', '.checklist-item .simple-checkbox')
      .on('change', '.checklist-item .simple-checkbox', function() {
        $.post(this.dataset.updateUrl, {checked: this.checked})
      })

    // Checklist item delete
    $(stepContainer).off('click', '.checklist-item .checklist-delete')
      .on('click', '.checklist-item .checklist-delete', function() {
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
    $(stepContainer).off('click', '.new-checklist-item')
      .on('click', '.new-checklist-item', function() {
        var checklist = $(this).closest('.checklist')
        var createUrl = checklist.data('checklist-create-url');
        var text = $(this).find('.text').html();
        $.post(createUrl, {text: text}, function(result) {
          $(result.html).appendTo(checklist.find('.checklist-items')).find('textarea').focus().select()
        })
      })
  }

  return {
    init: () => {
      if ($('.steps-container').length) {
        initTinyMCE()
        initChecklists()
        initStepMove()
        initStepDestroy()
        initStepCreateButton()
        StepAssets.init()
        StepTables.init()
      }
    },
  };
}());

$(document).on('turbolinks:load', function() {
  inlineSteps.init();
});
