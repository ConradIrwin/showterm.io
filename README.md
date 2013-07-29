This is the server backend for [showterm](https://github.com/ConradIrwin/showterm).

It's hopefully available on the internet at
[http://showterm.io](https://showterm.herokuapp.com), but it might still only be at
[https://showterm.herokuapp.com](https://showterm.herokuapp.com).

Private server
==============

If you'd like to run your own showterm server it should "just work". For small
installations you can use the builtin server that comes with rails in a few easy steps:

1. git clone https://github.com/ConradIrwin/showterm.io
2. Set up a database (I've only tested postgres), and add a config/database.yml
3. `bundle install`
4. `rails s`

You'll also need to configure your user's `showterm` clients by adding `export SHOWTERM_SERVER`
to their `~/.bashrc`s.

Meta-fu
=======
As usual bug-reports and pull-requests are very welcome. Everything is licensed under the
MIT license.

