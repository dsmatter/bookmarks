module Bookmarks
	class Token < ActiveRecord::Base
		validates_uniqueness_of :key
		belongs_to :user
		before_create :generate_key

		def generate_key
			chars = ('a'..'z').to_a + ('A'..'Z').to_a + ('0'..'9').to_a
			result = ''
			40.times do
				result << chars[rand(chars.size)]
			end
			self.key = result
		end
	end
end