var StepTables = (function() {
  var stepContainer = '.steps-container';

  function exportTableToDescription() {
    $(stepContainer).off('click', '.hot-table .export-to-description')
      .on('click', '.hot-table .export-to-description', function() {
        var table = $(this).closest('.hot-table').find('.ht_master .htCore').clone()
        var descriptionForm = $(this).closest('.inline-step').find('.step-description form.edit_step')
        var description = descriptionForm.find('textarea').val()
        table.removeClass('htCore')
          .attr('data-mce-style', 'border-collapse: collapse; width: 100%;')
          .css('border-collapse', 'collapse').css('width', '100%')
        descriptionForm.find('textarea').val(description + table.prop('outerHTML'))
        $(this).closest('.inline-step').find('#protocol_description_view').append(table)
        descriptionForm.submit()
      })
  }

  function initTables() {
    $(stepContainer).find("[data-role='hot-table']").each(function()  {
      var $container = $(this).find("[data-role='step-hot-table']");
      var contents = $(this).find('.hot-contents');

      $container.handsontable({
        startRows: GLOBAL_CONSTANTS.HANDSONTABLE_INIT_ROWS_CNT,
        startCols: GLOBAL_CONSTANTS.HANDSONTABLE_INIT_COLS_CNT,
        rowHeaders: true,
        colHeaders: true,
        fillHandle: false,
        formulas: true,
        cells: function (row, col, prop) {
          var cellProperties = {};

          if (col >= 0)
            cellProperties.readOnly = true;
          else
            cellProperties.readOnly = false;

          return cellProperties;
        }
      });
      renderTable($container);
      var hot = $container.handsontable('getInstance');

      if (contents.attr("value")) {
        var data = JSON.parse(contents.attr("value"));
        if (Array.isArray(data.data)) hot.loadData(data.data);
        setTimeout(() => {
          hot.render()
        }, 0)
      }
    });
  }

  function renderTable(table) {
    $(table).handsontable("render");
    // Yet another dirty hack to solve HandsOnTable problems
    if (parseInt($(table).css('height'), 10) < parseInt($(table).css('max-height'), 10) - 30) {
      $(table).find('.ht_master .wtHolder').css({ 'height': '100%',
                                                  'width': '100%' });
    }
  }

  return {
    init: () => {
      initTables()
      exportTableToDescription()
    }
  };
}());