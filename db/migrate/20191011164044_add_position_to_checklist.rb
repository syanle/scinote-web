# frozen_string_literal: true

class AddPositionToChecklist < ActiveRecord::Migration[5.2]
  def change
    add_column :checklists, :position, :integer
  end
end
