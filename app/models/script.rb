class Script < ActiveRecord::Base
  attr_accessible :scriptfile, :timingfile, :slug, :ip_address
end
