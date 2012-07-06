module Bookmarks
	class User < ActiveRecord::Base
		validates_length_of :username, :within => 3..40
		validates_length_of :passphrase, :within => 5..40
		validates_presence_of :username, :passphrase, :passphrase_confirmation, :salt
		validates_uniqueness_of :username
		validates_confirmation_of :passphrase

		attr_protected :id, :salt

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

		def passphrase=(pass)
			@passphrase = pass
			self.salt ||= User.random_string(10)
			self.password = User.encrypt(pass, self.salt)
		end

	end
end