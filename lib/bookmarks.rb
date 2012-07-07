require "active_record"
require "sqlite3"
require "bookmarks/version"
require "bookmarks/db/config"
require "bookmarks/web/WebApp"


module Bookmarks
	# Connect to database
	ActiveRecord::Base.establish_connection(DB_CONFIG)

	# Require rest
	dir_requires = ['bookmarks/models']
	dir_requires.each do |dir|
		Dir[File.join(File.dirname(__FILE__), dir) + '/*.rb'].each do |file|
			require file
		end
	end
end
