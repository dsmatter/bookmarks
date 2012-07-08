class CreateBookmarks < ActiveRecord::Migration
	def self.up
		create_table :bookmarks do |t|
			t.string :title, :null => false
			t.string :url, :null => false
			t.string :list_id, :null => false, :reference => true, :delete => :cascade
			t.datetime :created_at, :null => false
		end
	end

	def self.down
		drop_table :bookmarks
	end
end