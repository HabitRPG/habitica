class AddMoneyToUser < ActiveRecord::Migration
  def change
    add_column :users, :money, :float, :default=>0.0
  end
end
