class AddColumnsToScripts < ActiveRecord::Migration
  def change
    add_column :scripts, :columns, :integer, :default => 80
  end
end
