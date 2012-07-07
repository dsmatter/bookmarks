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
	end
end