class CreateTokens < ActiveRecord::Migration
	def self.up
		create_table :tokens do |t|
			t.string :key, :null => false
			t.integer :user_id, :null => false
		end
	end

	def self.down
		drop_table :tokens
	end
end