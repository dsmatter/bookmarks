#!/usr/bin/env rake
require 'bundler/gem_tasks'
require 'active_record'
require File.expand_path('../lib/bookmarks/db/config', __FILE__)

### Dirs and files

public_dir = File.expand_path('../lib/bookmarks/web/public', __FILE__)
js_dir     = File.join(public_dir, 'js')
js_order   = ['jquery-1.7.2.min.js', 'jquery-ui.min.js', 'jquery-ui-timepicker-addon.js', 
			  'jquery.showLoading.min.js', 'overview.js']
js_all     = 'all.min.js'

css_dir    = File.join(public_dir, 'css')
css_all    = 'all.min.css'

### Tasks

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

desc 'Minify js files'
task :minify_js do
	closure_cmd_prefix = 'java -jar closure_compiler.jar'
	cmd = '%s %s > %s' % [
		closure_cmd_prefix,
		js_order.map { |fn| '"' + File.join(js_dir, fn) + '"' }.join(' '),
		File.join(js_dir, js_all)
	]
	puts cmd
	system(cmd)
end

desc 'Unminify js files'
task :unminify_js do
	open(File.join(js_dir, js_all), 'w') do |f|
		js_order.each do |fn|
			f.puts "document.write('<script src=\"/js/#{fn}\"></script>');"
		end
	end
end

desc 'Minify css files'
task :minify_css do
	File.truncate(File.join(css_dir, css_all), 0)
	cmd = "cat #{css_dir}/*.css | cleancss -o #{File.join css_dir, css_all}"
	puts cmd
	system cmd
end

desc 'Unminify css files'
task :unminify_css do
	open(File.join(css_dir, css_all), 'w') do |f|
		Dir[File.join css_dir, '*.css'].each do |fn|
			next if fn =~ /\/all\.min\.css/
			f.puts "@import \"/css/#{File.basename fn}\";"
		end
	end
end

desc 'Change to production environment'
task :production => [:minify_js, :minify_css] do
end

desc 'Change to development environment'
task :development => [:unminify_js, :unminify_css] do
end
