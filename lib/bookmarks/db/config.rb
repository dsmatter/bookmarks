module Bookmarks
	DB_CONFIG = {
		:adapter => 'sqlite3',
		:database => File.expand_path('~/.bookmarks.db'),
		:pool => 20
	}
end