#!/usr/bin/env rake
require 'bundler/gem_tasks'
require 'active_record'
require File.expand_path('../lib/bookmarks/db/config', __FILE__)

task :default => :migrate

desc 'Migrate the database'
task :migrate => :environment do
	version = ENV['VERSION']
	version = version.to_i if version
	ActiveRecord::Migrator.migrate('lib/bookmarks/db/migrations', version)
end

task :environment do
	ActiveRecord::Base.establish_connection(Bookmarks::DB_CONFIG)
end