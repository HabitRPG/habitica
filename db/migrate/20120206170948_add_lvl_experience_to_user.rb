class AddLvlExperienceToUser < ActiveRecord::Migration
  def up
    add_column :users, :exp, :float, :default=>0.0
    add_column :users, :lvl, :integer, :default=>1
  end
  
  def down
    remove_column :users, :exp
    remove_column :users, :lvl
  end
end
