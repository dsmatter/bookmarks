require 'haml'
require "active_record"
require "sqlite3"
require "bookmarks/version"
require "bookmarks/db/config"
require "bookmarks/web/web_app"


module Bookmarks
	# Connect to database
	ActiveRecord::Base.establish_connection(DB_CONFIG)

	# Require rest
	require_dirs = ['bookmarks/models']
	require_dirs.each do |dir|
		Dir[File.join(File.dirname(__FILE__), dir) + '/*.rb'].each do |file|
			require file
		end
	end
end
