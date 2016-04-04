# See https://devcenter.heroku.com/articles/deploying-rails-applications-with-the-puma-web-server

thread_count = Integer(ENV['MAX_THREADS'] || 4)
threads thread_count, thread_count

preload_app!

rackup DefaultRackup
port ENV['PORT'] || 3000
environment ENV['RACK_ENV'] || 'development'

on_worker_boot do
  ActiveRecord::Base.establish_connection
end
