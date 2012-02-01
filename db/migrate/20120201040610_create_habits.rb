class CreateHabits < ActiveRecord::Migration
  def change
    create_table :habits do |t|
      t.string :name
      t.text :notes
      t.boolean :daily, :default => true
      t.boolean :up, :default => true
      t.boolean :down, :default => true
      t.integer :value, :default => 1
      t.integer :score, :default => 0

      t.timestamps
    end
  end
end
