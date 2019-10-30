class StepAssetsController < ApplicationController

  before_action :load_vars, only: %i(create)
  before_action :check_manage_permissions, only: %i(create edit update)

  def create
    new_asset = Asset.create(created_by: current_user, last_modified_by: current_user, team: current_team)
    new_asset.file.attach(params[:blob_id])
    @step.assets << new_asset
    render json: {
        html: render_to_string(
          partial: 'steps/attachments/item.html.erb',
             locals: { asset: new_asset,
                       i: 0,
                       assets_count: 0,
                       step: @step,
                       order_atoz: 0,
                       order_ztoa: 0 }
        )
      }
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