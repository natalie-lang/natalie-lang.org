#!/bin/bash

rsync -avz --exclude='.git' --exclude='deploy.sh' --delete ./ deploy@natalie-lang.org:/var/www/statics/natalie-lang.org/
