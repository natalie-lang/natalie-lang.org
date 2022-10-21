# natalie-lang.org website

This is the server and static files that hosts https://natalie-lang.org.

There is a companion app called [natalie-spec-stats-api](https://github.com/natalie-lang/natalie-spec-stats-api)
that stores stats from nightly builds of Natalie.

## How it Works

This is a completely static site, but for fun, we serve up the static
files from a Natalie binary, compiled from [server.rb](/server.rb).

The server only serves known files, so if you add a file to this site,
you must update server.rb to know about it.

## Running Locally

```sh
docker build . -t natalie-lang
docker run -it --rm -p 3000:3000 natalie-lang
```

Visit http://localhost:3000

## Deployment

I (Tim) deploy this with [Dokku](https://dokku.com/) on a server of mine.
Mostly for my own benefit, here are the configs:

```
$ dokku config:show natalie-lang.org | grep -v GIT_REV
=====> natalie-lang.org env vars
DOKKU_APP_RESTORE:       1
DOKKU_APP_TYPE:          dockerfile
DOKKU_DOCKERFILE_PORTS:  3000
DOKKU_PROXY_PORT:        80
DOKKU_PROXY_PORT_MAP:    http:80:3000 https:443:3000
DOKKU_PROXY_SSL_PORT:    443

$ dokku storage:list natalie-lang.org
natalie-lang.org volume bind-mounts:
     /var/lib/dokku/data/storage/natalie-lang-stats:/stats/

$ dokku docker-options:report natalie-lang.org
=====> natalie-lang.org docker options information
       Docker options build:                                   
       Docker options deploy:         --restart=on-failure:10 -v /var/lib/dokku/data/storage/natalie-lang-stats:/stats/ 
       Docker options run:            --cap-drop=ALL -v /var/lib/dokku/data/storage/natalie-lang-stats:/stats/

$ dokku proxy:ports natalie-lang.org
-----> Port mappings for natalie-lang.org
    -----> scheme  host port  container port
    http           80         3000
    https          443        3000
```
