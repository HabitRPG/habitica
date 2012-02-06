class CreateRewards < ActiveRecord::Migration
  def change
    create_table :rewards do |t|
      t.string :name
      t.integer :value, :default=>20
      t.integer :position, :default=>0
      t.references :user

      t.timestamps
    end
  end
end
