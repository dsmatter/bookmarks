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

		def <=>(other)
			other.created_at <=> self.created_at
		end

		def notify(excluded_user=nil)
			self.list.users.reject { |user| user == excluded_user }.each do |user|
				tag_string = self.tags.map { |tag| "@#{tag.name}" }.join(' ')
				begin
					user.notifier.mail("[Bookmarks] New bookmark in #{self.list.title}", "%s\n%s\n%s" %
						[self.title, tag_string, self.url])
				rescue # may fail
				end
			end
		end
	end
end