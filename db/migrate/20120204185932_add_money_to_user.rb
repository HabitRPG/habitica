class AddMoneyToUser < ActiveRecord::Migration
  def up
    add_column :users, :money, :float, :default=>0.0
  end
  
  def down
    remove_column :users, :money
  end
end
