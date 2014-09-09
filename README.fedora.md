Howto install showterm.io on Fedora (20)
========================================

Prepare database
----------------

Create user and database on existing MySQL (mariadb exactly) installation

	CREATE USER '***'@'localhost' IDENTIFIED BY '*******';
	
	GRANT USAGE ON *.* TO '***'@'localhost' IDENTIFIED BY '**********' WITH MAX_QUERIES_PER_HOUR 0 MAX_CONNECTIONS_PER_HOUR 0 MAX_UPDATES_PER_HOUR 0 MAX_USER_CONNECTIONS 0 ;
	
	CREATE DATABASE IF NOT EXISTS showterm CHARACTER SET utf8;
	
	GRANT ALL PRIVILEGES ON showterm.* TO '***'@'localhost';

Install
-------

Make sure all deps are installed (some deps are for mod_passenger: gcc-c++, curl-devel and httpd-devel )

	yum install ruby-devel gcc gcc-c++ make mysql-devel git curl-devel httpd-devel

Prepare install (as root): grant apache user to his home directory and install gem

	chown apache /var/www
	gem install execjs therubyracer bundler rake

Clone showterm.io project

	su - apache -s /bin/bash
	cd /var/www
	git clone https://github.com/ConradIrwin/showterm.io

Edit Gemfile
* Specify MySQL Database: replace 'pg' with 'mysql2'
* Set lower ruby version

	cd /var/www/showterm.io
	sed -i -e 's/pg/mysql2/' Gemfile
	sed -i -e '/^ruby/ s/2.1.1/2.0.0/' Gemfile
	
Create config/database.yml file like this.

Set MySQL user to root for now, and change it when database will be populated.

	cat << EOF > config/database.yml
	production:
	  adapter: mysql2
	  encoding: utf8
	  reconnect: false
	  database: showterm
	  pool: 10
	  username: ******
	  password: "************"
	development:
	  adapter: mysql2
	  encoding: utf8
	  reconnect: false
	  database: showterm_development
	  pool: 5
	  username: ******
	  password: "************"
	test:
	  adapter: mysql2
	  encoding: utf8
	  reconnect: false
	  database: showterm_test
	  pool: 5
	  username: ******
	  password: "************"
	EOF

Setup application
-----------------

	bundle install
	bundle exec rake db:create db:migrate db:seed RAILS_ENV=production
	bundle exec rake assets:precompile RAILS_ENV=production
	
First test
----------

Launch WEBrick HTTP server

	script/rails server --binding=127.0.0.1 --environment=production

Point your web browser to [localhost:3000](http://localhost:3000) and check if page was printed.

Install mod_passenger
---------------------

Install passenger gem and compile apache module as root

	gem install passenger
	passenger-install-apache2-module

Copy/Paste instructions on /etc/httpd/conf.d/passenger.conf apache configuration file

	cat << EOF > /etc/httpd/conf.d/passenger.conf
	oadModule passenger_module /usr/local/share/gems/gems/passenger-4.0.50/buildout/apache2/mod_passenger.so
	<IfModule mod_passenger.c>
		PassengerRoot /usr/local/share/gems/gems/passenger-4.0.50
		PassengerDefaultRuby /usr/bin/ruby
	</IfModule>
	EOF

Create Apache vhost for showterm

	cat << EOF > /etc/httpd/conf.d/showterm.conf
	NameVirtualHost *:80
	
	<VirtualHost *:80>
	      ServerName showterm.******.com
	      DocumentRoot /var/www/showterm.io/public/
	      
	      ErrorDocument 404 /404.html
	      ErrorDocument 422 /422.html
	      ErrorDocument 500 /500.html
	      
	      LogFormat "%{X-Forwarded-For}i %l %u %t \"%r\" %>s %b" common_forwarded
	      ErrorLog  logs/showterm.b2pweb.com_error.log
	      CustomLog logs/showterm.b2pweb.com_forwarded.log common_forwarded
	      CustomLog logs/showterm.b2pweb.com_access.log combined env=!dontlog
	      CustomLog logs/showterm.b2pweb.com.log combined
	      
	      <Directory /var/www/showterm.io/public>
	         AllowOverride all
	         # MultiViews must be turned off.
	         Options -MultiViews
	         <IfModule mod_authz_core.c>
	                # Apache 2.4
	                <RequireAny>
	                        Require ip 127.0.0.1
	                        Require ip ::1
	                        Require ip 192.168.0.0/24
	                </RequireAny>
	         </IfModule>
	         <IfModule !mod_authz_core.c>
	                # Apache 2.2
	                Order Deny,Allow
	                Deny from All
	                Allow from 127.0.0.1
	                Allow from ::1
	                Allow from 192.168.0.0/24
	         </IfModule>
	      </Directory>
	</VirtualHost>
	EOF

Restart apache

	systemctl restart httpd
