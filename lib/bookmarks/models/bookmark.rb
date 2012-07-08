module Bookmarks
	class Bookmark < ActiveRecord::Base
		validates_presence_of :title, :url
		belongs_to :list
		has_and_belongs_to_many :tags
		before_create :initial_values
		
		def initial_values
			self.created_at = Time.now
		end
	end
end