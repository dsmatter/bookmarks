require 'sinatra'

module Bookmarks
	class WebApp < Sinatra::Base
		get '/' do
			"hello world"
		end
	end
end