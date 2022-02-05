task :deploy do
  sh "rsync -avz --exclude='.git' --delete ./ deploy@natalie-lang.org:/var/www/statics/natalie-lang.org/"
end
