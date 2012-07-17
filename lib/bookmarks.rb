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

	class Notifier
		def initialize(email)
			@email = email
		end

		def mail(subject, content)
			begin
				cmd = "echo \"#{content}\" | mail -s \"#{subject}\" \"#{@email}\""
				puts cmd
				system cmd
			rescue # may fail
			end
		end
	end

	AdminNotifier = Notifier.new('webmaster@smattr.de')
end
