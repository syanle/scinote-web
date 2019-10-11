class ChecklistItemsController < ApplicationController
  def reorder
    ChecklistItem.reorder_checklist_items(params[:checklist_items])
    render json: {status: :ok}
  end
end