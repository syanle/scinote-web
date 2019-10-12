class ChecklistItem < ApplicationRecord
  auto_strip_attributes :text, nullify: false
  validates :text,
            presence: true,
            length: { maximum: Constants::TEXT_MAX_LENGTH }
  validates :checklist, presence: true
  validates :checked, inclusion: { in: [true, false] }

  belongs_to :checklist,
             inverse_of: :checklist_items
  belongs_to :created_by,
             foreign_key: 'created_by_id',
             class_name: 'User',
             optional: true
  belongs_to :last_modified_by,
             foreign_key: 'last_modified_by_id',
             class_name: 'User',
             optional: true

  def self.reorder_checklist_items(checklist_items)
    checklist_items.each_with_index do |checklist_item, position|
      find(checklist_item).update(position: position)
    end
  end

  def self.add_item(checklist, text, user)
    position = checklist.checklist_items.count + 1
    create(
      text: text,
      created_by_id: user.id,
      checklist_id: checklist.id
    )
  end
end
