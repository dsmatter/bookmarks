module Bookmarks
	DB_CONFIG = {
		:adapter => 'sqlite3',
    :database => File.expand_path('../../../../db/bookmarks.db', __FILE__),
		:pool => 20
	}
end