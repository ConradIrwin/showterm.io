class RecordController < ApplicationController
  def showterm
    render :text => render_to_string('showterm', :layout => false), :content_type => 'text/plain'
  end
end
