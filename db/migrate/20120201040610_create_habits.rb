class CreateHabits < ActiveRecord::Migration
  def change
    create_table :habits do |t|
      t.references :user
      t.string  :name
      t.integer :habit_type, :default => 1
      t.integer :score, :default => 0
      t.text    :notes
      t.boolean :up, :default => true
      t.boolean :down, :default => true
      t.boolean :done, :default => false
      t.integer :position, :default => 0

      t.timestamps
    end
  end
end
