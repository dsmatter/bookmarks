# -*- encoding: utf-8 -*-
require File.expand_path('../lib/bookmarks/version', __FILE__)

Gem::Specification.new do |gem|
  gem.authors       = ["Daniel Strittmatter"]
  gem.email         = ["daniel@stritty.de"]
  gem.description   = %q{A simple bookmark service}
  gem.summary       = %q{Save and share your favorite sites}
  gem.homepage      = ""

  gem.files         = `git ls-files`.split($\)
  gem.files         << 'lib/bookmarks/web/public/js/all.min.js'
  gem.files         << 'lib/bookmarks/web/public/css/all.min.css'
  gem.files.reject! { |f| f =~ /closure_compiler/ }
  gem.executables   = gem.files.grep(%r{^bin/}).map{ |f| File.basename(f) }
  gem.test_files    = gem.files.grep(%r{^(test|spec|features)/})
  gem.name          = "bookmarks"
  gem.require_paths = ["lib"]
  gem.version       = Bookmarks::VERSION
end
