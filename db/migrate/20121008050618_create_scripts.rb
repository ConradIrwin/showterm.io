class CreateScripts < ActiveRecord::Migration
  def change
    create_table :scripts do |t|
      t.string :slug
      t.text :scriptfile
      t.text :timingfile
      t.string :ip_address

      t.timestamps
    end

    add_index :scripts, :slug
  end
end
