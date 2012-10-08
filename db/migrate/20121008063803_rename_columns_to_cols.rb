class RenameColumnsToCols < ActiveRecord::Migration
  def up
    rename_column :scripts, :columns, :cols
  end

  def down
    rename_column :scripts, :cols, :columns
  end
end
