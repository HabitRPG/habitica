class CreateHabits < ActiveRecord::Migration
  def change
    create_table :habits do |t|
      t.string :name
      t.text :notes
      t.boolean :daily
      t.integer :value

      t.timestamps
    end
  end
end
