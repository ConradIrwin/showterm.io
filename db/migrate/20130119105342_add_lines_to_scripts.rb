class AddLinesToScripts < ActiveRecord::Migration
  def change
    add_column :scripts, :lines, :integer, :default => nil
  end
end
