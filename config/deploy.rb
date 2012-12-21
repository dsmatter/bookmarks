require 'mina/bundler'
require 'mina/rails'
require 'mina/git'
# require 'mina/rbenv'  # for rbenv support. (http://rbenv.org)
# require 'mina/rvm'    # for rvm support. (http://rvm.io)

# Basic settings:
#   domain       - The hostname to SSH to.
#   deploy_to    - Path to deploy into.
#   repository   - Git repo to clone from. (needed by mina/git)
#   branch       - Branch name to deploy. (needed by mina/git)

set :domain, 'smatterling.de'
set :deploy_to, '/srv/bookmarks'
set :user, 'bookmarks'
set :identity_file, 'keys/deploy.pem'
set :repository, 'git@smatterling.de:smatter/bookmarks.git'
set :branch, 'master'
set :server_pid, '/tmp/pids/bookmarks.pid'

# Manually create these paths in shared/ (eg: shared/config/database.yml) in your server.
# They will be linked in the 'deploy:link_shared_paths' step.
#set :shared_paths, ['config/database.yml', 'log']
set :shared_paths, ['db', 'config']

# Optional settings:
#   set :user, 'foobar'    # Username in the server to SSH to.
#   set :port, '30000'     # SSH port number.

# This task is the environment that is loaded for most commands, such as
# `mina deploy` or `mina rake`.
task :environment do
  # If you're using rbenv, use this to load the rbenv environment.
  # Be sure to commit your .rbenv-version to your repository.
  # invoke :'rbenv:load'

  # For those using RVM, use this to load an RVM version@gemset.
  # invoke :'rvm:use[ruby-1.9.3-p125@default]'
end

# Put any custom mkdir's in here for when `mina setup` is ran.
# For Rails apps, we'll make some of the shared paths that are shared between
# all releases.
task :setup => :environment do
  # queue! %[mkdir -p "#{deploy_to}/shared/log"]
  # queue! %[chmod g+rx,u+rwx "#{deploy_to}/shared/log"]

  unicorn_stub = %[worker_processes 1
preload_app true
listen "/tmp/bookmarks.socket"
pid "/tmp/pids/bookmarks.pid"]

  database_stub = %[---
adapter: sqlite3
database: db/bookmarks.db
pool: 20]

  queue! %[mkdir -p "#{deploy_to}/shared/config"]
  queue! %[chmod g+rx,u+rwx "#{deploy_to}/shared/config"]

  queue! %[mkdir -p "#{deploy_to}/shared/db"]
  queue! %[chmod g+rx,u+rwx "#{deploy_to}/shared/db"]

  queue! %[touch "#deploy_to/shared/config/database.yaml"]
  queue! %[echo '#{database_stub}' > #deploy_to/shared/config/database.yaml]
  queue  %[echo "-----> Be sure to edit 'shared/config/database.yaml'"]

  queue! %[touch "#{deploy_to}/shared/config/unicorn.rb"]
  queue! %[echo '#{unicorn_stub}' > #{deploy_to}/shared/config/unicorn.rb]
  queue  %[echo "-----> Be sure to edit 'shared/config/unicorn.rb'"]

  # queue! %[touch "#{deploy_to}/shared/config/database.yml"]
  # queue  %[-----> Be sure to edit 'shared/config/database.yml'.]
end

desc 'Start production server'
task :start do
  queue 'bundle exec foreman start'
end

desc 'Stop production server'
task :stop do
  queue "if [[ -f #{server_pid} ]]; then kill -QUIT $(cat #{server_pid}); rm #{server_pid}; fi"
end

desc 'Restart the production server'
task :restart => [:stop, :start]

desc "Deploys the current version to the server."
task :deploy => :environment do
  deploy do
    # Put things that will set up an empty directory into a fully set-up
    # instance of your project.
    invoke :'git:clone'
    invoke :'deploy:link_shared_paths'
    invoke :'bundle:install'

    queue 'rake migrate'
    queue 'rake production'
    # invoke :'rails:db_migrate'
    # invoke :'rails:assets_precompile'

    to :launch do
      invoke :restart
    end
  end
end

# For help in making your deploy script, see the Mina documentation:
#
#  - http://nadarei.co/mina
#  - http://nadarei.co/mina/tasks
#  - http://nadarei.co/mina/settings
#  - http://nadarei.co/mina/helpers

