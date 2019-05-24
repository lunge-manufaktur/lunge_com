###
# Compass
###

# Change Compass configuration
# compass_config do |config|
#   config.output_style = :compact
# end

###
# Page options, layouts, aliases and proxies
###

# Per-page layout changes:
#
# With no layout
# page "/path/to/file.html", :layout => false
#
# With alternative layout
# page "/path/to/file.html", :layout => :otherlayout
#
# A path which all have the same layout
# with_layout :admin do
#   page "/admin/*"
# end

# Proxy pages (https://middlemanapp.com/advanced/dynamic_pages/)
# proxy "/this-page-has-no-template.html", "/template-file.html", :locals => {
#  :which_fake_page => "Rendering a fake page with a local variable" }

# load Dotenv
require 'dotenv/load'

###
# Helpers
require "lib/helpers"
helpers Helpers
###

activate :sprockets

# Automatic image dimensions on image_tag helper
# activate :automatic_image_sizes

# Reload the browser automatically whenever files change
configure :development do
  activate :livereload
end

activate :autoprefixer do |config|
  config.browsers = ['last 2 versions', 'Explorer >= 9']
  config.remove   = false
  config.cascade  = false
  config.inline   = true
  config.ignore   = ['hacks.css']
end

# Methods defined in the helpers block are available in templates
# helpers do
#   def some_helper
#     "Helping"
#   end
# end

require "slim"

# activate :imageoptim do |options|
#   # lossy mode allowed?
#   options.allow_lossy = true

#   # Use a build manifest to prevent re-compressing images between builds
#   options.manifest = true

#   # Silence problematic image_optim workers
#   options.skip_missing_workers = true

#   # Cause image_optim to be in shouty-mode
#   options.verbose = false

#   # Setting these to true or nil will let options determine them (recommended)
#   options.nice = true
#   options.threads = true

#   # Image extensions to attempt to compress
#   options.image_extensions = %w(.png .jpg .gif .svg)

#   # Compressor worker options, individual optimisers can be disabled by passing
#   # false instead of a hash
#   options.advpng    = { :level => 4 }
#   options.gifsicle  = { :interlace => false }
#   options.jpegoptim = { :strip => ['all'], :max_quality => 80 }
#   options.jpegtran  = { :copy_chunks => false, :progressive => true, :jpegrescan => true }
#   options.optipng   = { :level => 7, :interlace => false }
#   options.pngcrush  = { :chunks => ['alla'], :fix => false, :brute => false }
#   options.pngout    = false
#   options.svgo      = false
# end

set :css_dir, 'stylesheets'

set :js_dir, 'javascripts'

set :images_dir, 'images'

# Build-specific configuration
configure :build do
  # For example, change the Compass output style for deployment
  activate :minify_css

  # Minify Javascript on build
  activate :minify_javascript

  # Enable cache buster
  # activate :asset_hash

  # Use relative URLs
  # activate :relative_assets

  # Or use a different image path
  # set :http_prefix, "/Content/images/"
end

# Process hidden files
# after_build do |builder|
#   src = File.join(config[:source],"_redirects")
#   dst = File.join(config[:build_dir],"_redirects")
#   builder.thor.source_paths << File.dirname(__FILE__)
#   builder.thor.copy_file(src,dst)
# end

import_file File.expand_path("_headers", config[:source]), "/_headers"
import_file File.expand_path("_redirects", config[:source]), "/_redirects"


activate :i18n, langs: [:de, :en]
activate :directory_indexes

activate :blog do |blog|
  blog.sources = "/blog/{year}-{month}-{day}-{title}.html"
  blog.permalink = "/blog/{title}.html"
end