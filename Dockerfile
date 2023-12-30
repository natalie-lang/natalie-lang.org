FROM ruby:3.3 as builder

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y -q build-essential autoconf libtool lcov
RUN gem install bundler --no-doc

ENV LC_ALL C.UTF-8

RUN git clone https://github.com/natalie-lang/natalie.git /natalie && \
  cd /natalie && \
  git checkout c98726be03c252969ea7820f6e2ad3c6facc7376

WORKDIR /natalie
RUN rake build_release

COPY . /natalie-lang.org
WORKDIR /natalie-lang.org
RUN /natalie/bin/natalie -c server server.rb && \
  strip server

# # # #

FROM ubuntu:jammy
COPY --from=builder /natalie-lang.org/server /server

COPY CHECKS /

RUN useradd deploy
USER deploy

EXPOSE 3000

ENTRYPOINT ["/server"]
