class AddLvlExperienceToUser < ActiveRecord::Migration
  def up
    add_column :users, :exp, :float, :default=>0.0
    add_column :users, :lvl, :integer, :default=>1
    User.update_all ["lvl = ?", 1]
    User.update_all ["exp = ?", 0.0]
  end
  
  def down
    remove_column :users, :exp
    remove_column :users, :lvl
  end
end
