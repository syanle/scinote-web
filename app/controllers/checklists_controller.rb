class ChecklistsController < ApplicationController

  before_action :load_vars, except: :reorder

  def reorder
    Checklist.reorder_checklists(params[:checklists])
    render json: {status: :ok}
  end

  def create
    checklist = Checklist.add_checklist(@step, current_user)
    render json: {
      html: render_to_string({
        partial: "steps/inline_step/checklist.html.erb", locals: {
          step: @step,
          checklist: checklist
        }
      })
    }
  end

  def update
    @checklist.update(name: params[:checklist][:name])
  end

  def destroy
    if @checklist.destroy
      render json: {status: :ok}
    end
  end

  private 

  def load_vars
    @checklist = Checklist.find(params[:id]) if params[:id]
    @step = Step.find(params[:step_id])
  end

end