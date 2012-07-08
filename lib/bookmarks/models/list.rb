module Bookmarks
	class List < ActiveRecord::Base
		validates_presence_of :title
		has_and_belongs_to_many :users
		has_many :bookmarks
		before_create :initial_values
		before_destroy :delete_dependencies

		def initial_values
			self.created_at = Time.now
		end

	end
end