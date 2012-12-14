class CreateIndices < ActiveRecord::Migration
  def self.up
    add_index('bookmarks', ['list_id'], :name => 'bookmarks_list')
    add_index('lists_users', ['user_id'], :name => 'lists_users_user')
    add_index('lists_users', ['list_id'], :name => 'lists_users_list')
    add_index('bookmarks_tags', ['bookmark_id'], :name => 'bookmarks_tags_bookmark')
    add_index('bookmarks_tags', ['tag_id'], :name => 'bookmarks_tags_tag')
  end

  def self.down
    remove_index('bookmarks', :name => 'bookmarks_list')
    remove_index('lists_users', :name => 'lists_users_user')
    remove_index('lists_users', :name => 'lists_users_list')
    remove_index('bookmarks_tags', :name => 'bookmarks_tags_bookmark')
    remove_index('bookmarks_tags', :name => 'bookmarks_tags_tag')
  end
end