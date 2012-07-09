require 'sinatra'

module Bookmarks
	class LoginScreen < Sinatra::Base
		enable :sessions

		get '/login' do
			redirect '/' if session[:user]
			haml :login
		end

		post '/login' do
			user = User.authenticate(params[:user], params[:password])
			if user
				session[:user] = user.id
				redirect '/'
			else
				redirect '/login'
			end
		end

		get '/logout' do
			session[:user] = nil
			redirect '/'
		end

		get '/register' do
			redirect '/' if session[:user]
			haml :register
		end

		post '/register' do
			begin
				new_user = User.create(params)
				session[:user] = new_user.id
				redirect '/'
			rescue => e
				puts e
				redirect '/register'
			end
		end
	end

	class WebApp < Sinatra::Base
		use LoginScreen

		before do
			unless request.path =~ /^\/api/
				unless session[:user]
					redirect '/login'
				end
			end
		end

		def get_user
			User.find_by_id(session[:user])
		end

		def get_user_by_api_key(key)
			Token.find_by_key!(key).user
		end

		get '/' do
			haml :overview, :locals => {
				:user => get_user
			}
		end

		get '/user' do
			haml :user, :locals => {
				:user => get_user
			}
		end

		get '/new_list' do
			new_list = get_user.lists.create :title => 'New list'
			haml :partial_list, :layout => false, :locals => {
				:list => new_list
			}
		end

		delete '/list/:id' do
			begin
				list = List.find_by_id!(params[:id])

				# Check if user is subscribed to list
				raise 'Access denied' unless list.users.include?(get_user)

				list.delete
				"OK"
			rescue
				400
			end
		end

		post '/list/:id' do
			begin
				list = List.find_by_id(params[:id])
				list.update_attributes :title => params[:title]
				"OK"
			rescue => e
				400
			end
		end

		post '/bookmark/new' do
			begin
				list = List.find_by_id(params[:list])
				p list
				p get_user.lists

				# Check if user is subscribed to the list
				raise 'Access denied' unless get_user.lists.any? { |l|  l.id == list.id }

				new_bookmark = list.bookmarks.create :title => 'New bookmark', :url => 'http://www.google.de'
				haml :partial_bookmark, :layout => false, :locals => {
					:bookmark => new_bookmark
				}
			rescue => e
				p e
				400
			end
		end

		delete '/bookmark/:id' do
			begin
				Bookmark.find_by_id(params[:id]).delete
				"OK"
			rescue => e
				400
			end
		end

		post '/bookmark/:id' do
			begin
				bookmark = Bookmark.find_by_id(params[:id]);

				# Check if bookmark belongs to user
				raise 'Access denied' unless bookmark.list.users.include? get_user

				bookmark.update_attributes :title => params[:title], :url => params[:url]
				"OK"
			rescue => e
				p e
				400
			end
		end

		get '/tokens/new' do
			begin
				new_token = get_user.tokens.create!
				haml :partial_token, :layout => false, :locals => {
					:token => new_token
				}
			rescue => e
				400
			end
		end

		delete '/tokens/:id' do
			begin
				token = Token.find_by_id(params[:id])

				# Check if token belongs to user
				raise 'Access denied' unless token.user == get_user

				token.delete
				"OK"
			rescue => e
				400
			end
		end

		get '/api/bookmarks/add' do
			begin
				# Find the user
				user = get_user_by_api_key(params[:token])

				# Get the list
				list = params[:list] || user.lists.first
				raise 'No list' unless list

				# Add bookmark
				list.bookmarks.create! :title => params[:title], :url => params[:url]
				"OK"
			rescue => e
				400
			end
		end
	end
end