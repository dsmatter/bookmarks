module Bookmarks
	class User < ActiveRecord::Base
		validates_length_of :username, :within => 3..40
		validates_length_of :passphrase, :within => 5..40
		validates_presence_of :username, :passphrase, :passphrase_confirmation, :salt
		validates_uniqueness_of :username
		validates_confirmation_of :passphrase

		attr_protected :id, :salt
		has_and_belongs_to_many :lists
		has_many :tokens
		before_validation :setup_passphrase
		before_create :initial_values

		def self.random_string(len)
			chars = ('a'..'z').to_a + ('A'..'Z').to_a + ('0'..'9').to_a			
			result = ''
			len.times do
				result << chars[rand(chars.size)]
			end
			result
		end

		def self.encrypt(pass, salt)
			Digest::SHA1.hexdigest(pass+salt)
		end

		def self.authenticate(user, pass)
			user = find_by_username(user)
			if user && User.encrypt(pass, user.salt) == user.password
				user
			else
				nil
			end
		end

		def initial_values
			self.active = true
			self.created_at = Time.now
		end

		def setup_passphrase
			if self.password && !self.password.empty?
				@passphrase = 'dummyvalue'
				@passphrase_confirmation = 'dummyvalue'
			end
		end

		def passphrase=(pass)
			@passphrase = pass
			self.salt ||= User.random_string(10)
			self.password = User.encrypt(pass, self.salt)
		end

		def passphrase
			@passphrase
		end

		def friends
			self.lists.map(&:users).flatten.uniq.reject { |u| u.id == self.id }
		end

		def shares_with?(other_user)
			friends.include?(other_user)
		end

		def bookmarks
			self.lists.map(&:bookmarks).flatten
		end

		def bookmarks_with_tag(tag)
			self.bookmarks.select { |bookmark| bookmark.tags.include? tag }
		end

		def notifier
			Notifier.new self.email
		end

	end
end