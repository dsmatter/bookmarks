class CreateUsers < ActiveRecord::Migration
	def self.up
		create_table :users do |t|
			t.string :username, :null => false
			t.string :password, :null => false
			t.string :salt, :null => false
			t.string :email
			t.datetime :created_at, :null => false
			t.boolean :active, :null => false
		end
	end

	def self.down
		drop_table :users
	end
end