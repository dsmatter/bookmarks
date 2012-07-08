class CreateListsUsers < ActiveRecord::Migration
	def self.up
		create_table :lists_users do |t|
			t.integer :list_id, :null => false, :reference => true, :delete => :cascade
			t.integer :user_id, :null => false, :reference => true, :delete => :cascade
		end
	end

	def self.down
		drop_table :lists_users
	end
end