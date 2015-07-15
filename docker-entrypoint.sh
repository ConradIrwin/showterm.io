#!/bin/bash

# If DB doesn't already exist, copy pre-initialized db
if [ -f /var/showterm/showterm.sqlite3 ];
then
  chown -R showterm /var/showterm
else
  mv /srv/showterm/showterm.sqlite3 /var/showterm/showterm.sqlite3
  chown -R showterm /var/showterm
fi


# Start showterm
exec su showterm -s /bin/bash -p -c "bin/rails server"
