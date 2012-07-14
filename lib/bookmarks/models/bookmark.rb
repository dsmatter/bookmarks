require "uri"

module Bookmarks
	class Bookmark < ActiveRecord::Base
		validates_presence_of :title, :url
		belongs_to :list
		has_and_belongs_to_many :tags
		before_create :initial_values
		validates_format_of :url, :with => URI::regexp(%w(http https))
		
		def initial_values
			self.created_at = Time.now
		end

		def title_with_tags
			if self.tags.empty?
				self.title
			else
				tag_str = self.tags.map { |tag| "@#{tag.name}" }.join(' ')
				self.title + ' ' + tag_str
			end
		end
	end
end