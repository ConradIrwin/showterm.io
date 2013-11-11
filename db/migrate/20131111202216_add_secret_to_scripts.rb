class AddSecretToScripts < ActiveRecord::Migration
  def change
    add_column :scripts, :secret, :text, default: nil
  end
end
