class Script < ActiveRecord::Base
  attr_accessible :scriptfile, :timingfile, :slug, :ip_address, :cols, :lines, :secret
end
