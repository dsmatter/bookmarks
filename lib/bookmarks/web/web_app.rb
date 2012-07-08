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
			unless session[:user]
				redirect '/login'
			end
		end

		def get_user
			User.find_by_id(session[:user])
		end

		get '/' do
			haml :overview, :locals => {
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
				List.find_by_id(params[:id]).delete
				"OK"
			rescue
				302
			end
		end

		post '/list/:id' do
			begin
				list = List.find_by_id(params[:id])
				list.update_attributes :title => params[:title]
				"OK"
			rescue => e
				302
			end
		end

		post '/bookmark/new' do
			begin
				list = List.find_by_id(params[:list])
				p list
				p get_user.lists

				# Check if user is subscribed to the list
				raise 'Forbidden list' unless get_user.lists.any? { |l|  l.id == list.id }

				p "here"
				new_bookmark = list.bookmarks.create :title => 'New bookmark', :url => 'http://www.google.de'
				haml :partial_bookmark, :layout => false, :locals => {
					:bookmark => new_bookmark
				}
			rescue => e
				p e
				302
			end
		end

		delete '/bookmark/:id' do
			begin
				Bookmark.find_by_id(params[:id]).delete
				"OK"
			rescue => e
				302
			end
		end
	end
end