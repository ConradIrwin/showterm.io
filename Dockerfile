FROM ruby:2.1.2

# Add an unprivileged user
RUN adduser --disabled-login --system --gecos 'ShowTerm' showterm

# Install dependencies
RUN apt-get update \
  && apt-get -y install nodejs \
  && apt-get clean

RUN mkdir /srv/showterm \
  && chown -R showterm /srv/showterm

WORKDIR /srv/showterm
ADD Gemfile /srv/showterm/Gemfile
ADD Gemfile.lock /srv/showterm/Gemfile.lock

RUN bundle install --path=$(pwd)

# Insert shorterm source
ADD . /srv/showterm

# Set DB config & do DB init / seed
RUN cp config/database.yml.example config/database.yml \
  && bundle exec rake db:create db:migrate db:seed \
  && mv /var/showterm/showterm.sqlite3 ./showterm.sqlite3

EXPOSE 3000
VOLUME ["/var/showterm"]
ENTRYPOINT ["/srv/showterm/docker-entrypoint.sh"]
