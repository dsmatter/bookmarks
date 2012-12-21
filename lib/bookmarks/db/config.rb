require 'yaml'

module Bookmarks
  DB_CONFIG = YAML.load_file('config/database.yaml')
end