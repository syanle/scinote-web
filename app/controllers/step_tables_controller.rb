class StepTablesController < ApplicationController

  before_action :load_vars, only: %i(export_xlsx destroy)
  before_action :check_manage_permissions, only: %i(export_xlsx destroy)

  def destroy
    table = @step.tables.find(params[:id])
    if table.destroy
      render json: {status: :ok}
    end
  end

  def export_xlsx
    @table = @step.tables.find(params[:id])
    file_name = @table.name.empty? ? 'table_export' : @table.name.parameterize.underscore
    render xlsx: file_name, template: 'steps/inline_step/table_export.xlsx.axlsx'
  end

  private

  def load_vars
    @step = Step.find_by_id(params[:step_id])
    @protocol = @step&.protocol

    unless @protocol
      render_404
    end

    if @protocol.in_module?
      @my_module = @protocol.my_module
    end
  end

  def check_manage_permissions
    render_403 unless can_manage_protocol_in_module?(@protocol) ||
                      can_manage_protocol_in_repository?(@protocol)
  end
end