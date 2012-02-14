class AddTokenAuthentication < ActiveRecord::Migration
  def up
    add_column :users, :authentication_token, :string
  end

  def down
    remove_column :users, :authentication_token
  end
end
