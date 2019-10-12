class ChecklistItemsController < ApplicationController
  include ActionView::Helpers::TextHelper
  include ActionView::Helpers::UrlHelper
  include InputSanitizeHelper
  include ApplicationHelper

  before_action :load_vars, except: :reorder

  def reorder
    ChecklistItem.reorder_checklist_items(params[:checklist_items])
    render json: {status: :ok}
  end

  def update
    @checklist_item.text = params[:text]
    @checklist_item.save

    render json: {text: custom_auto_link(@checklist_item.text, simple_format: false, team: current_team)}
  end

  def create
    checklist_item = ChecklistItem.add_item(@checklist, params[:text], current_user)
    render json: {
      html: render_to_string({
        partial: "steps/inline_step/checklist_item.html.erb", locals: {
          step: @step,
          checklist: @checklist,
          checklist_item: checklist_item
        }
      })
    }
  end

  def checklist_item_state
    checked = params[:checked] == 'true'
    @checklist_item.update(checked: checked)
  end

  def destroy
    if @checklist_item.destroy
      render json: {status: :ok}
    end
  end

  private 

  def load_vars
    @checklist_item = ChecklistItem.find(params[:id]) if params[:id]
    @checklist = Checklist.find(params[:checklist_id])
    @step = Step.find(params[:step_id])
  end

end