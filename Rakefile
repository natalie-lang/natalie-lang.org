task :deploy do
  sh "rsync -avz --exclude='.git' --delete ./ deploy@natalie-lang.org:/var/www/statics/natalie-lang.org/"
end

task :deploy_new do
  sh 'git push dokku'
end
