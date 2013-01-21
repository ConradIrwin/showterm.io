class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :redirect_to_io

  def redirect_to_io
    if request.base_url == "http://showterm.com"
      redirect_to request.url.sub(".com", ".io")
    end
  end
end
