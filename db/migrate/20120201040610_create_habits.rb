class CreateHabits < ActiveRecord::Migration
  def change
    create_table :habits do |t|
      t.references :user
      t.string  :name
      t.integer :habit_type, :default => 1
      t.integer :score, :default => 0
      t.boolean :up, :default => true
      t.boolean :down, :default => true
      t.text    :notes
      t.datetime :votedate

      t.timestamps
    end
  end
end
