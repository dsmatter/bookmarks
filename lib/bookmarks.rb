require 'haml'
require 'json'
require "active_record"
require "memcache"
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

	class OverviewCache
		PREFIX = 'overview'

		def self.connect!
			@@connection = MemCache.new('localhost:11211')
		end

		def self.connect
			connect! if !@@connection
		end

		def self.get(user)
			connect!
			begin
				@@connection.get("#{PREFIX}-#{user.id}")
			rescue
				nil
			end
		end

		def self.set(user, result)
			connect!
			begin
				@@connection.set("#{PREFIX}-#{user.id}", result)
			rescue
			end
		end

		def self.invalidate(user)
			connect!
			begin
				@@connection.delete("#{PREFIX}-#{user.id}")
			rescue
			end
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
