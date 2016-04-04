class CreateDefinitions < ActiveRecord::Migration
  def change
    create_table :definitions do |t|
      t.string :fmt
      t.string :variables
      t.string :constants
      t.string :constraints

      t.timestamps null: false
    end
  end
end
