class ChecklistsController < ApplicationController

  before_action :load_vars, except: :reorder

  def reorder
    Checklist.reorder_checklists(params[:checklists])
    render json: {status: :ok}
  end

  def update
    @checklist.update(name: params[:checklist][:name])
  end

  private 

  def load_vars
    @checklist = Checklist.find(params[:id])
  end

end