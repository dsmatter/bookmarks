module Bookmarks
	class List < ActiveRecord::Base
		validates_presence_of :title
		has_and_belongs_to_many :users
		has_many :bookmarks

		before_create :initial_values
		before_destroy :delete_dependencies

		before_save :invalidate_cache
		before_update :invalidate_cache
		before_destroy :invalidate_cache
		after_commit :invalidate_cache

		def initial_values
			self.created_at = Time.now
		end

		def invalidate_cache
			self.users.each { |u| OverviewCache.invalidate(u) }
		end

		def notify_sharing_add(user)
			user.notifier.mail("[Bookmarks] The list '#{self.title}' is now shared with you", '')
		end

		def notify_sharing_remove(user)
			user.notifier.mail("[Bookmarks] You were removed from the list '#{self.title}'", '')
		end

		def <=>(other)
			title <=> other.title
		end
	end
end
