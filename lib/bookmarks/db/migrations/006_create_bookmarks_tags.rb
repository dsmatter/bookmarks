class CreateBookmarksTags < ActiveRecord::Migration
	def self.up
		create_table :bookmarks_tags do |t|
			t.integer :bookmark_id, :null => false, :reference => true, :delete => :cascade
			t.integer :tag_id, :null => false, :reference => true, :delete => :cascade
		end
	end

	def self.down
		drop_table :bookmarks_tags
	end
end