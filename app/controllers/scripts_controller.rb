class ScriptsController < ApplicationController
  def create
    render :text => 'No scriptfile given', :status => 400 unless params[:scriptfile]
    render :text => 'No timingfile given', :status => 400 unless params[:timingfile]

    slug = Digest::SHA1.hexdigest([params[:scriptfile], params[:timingfile]].inspect)

    Script.create(:scriptfile => params[:scriptfile],
                  :timingfile => params[:timingfile],
                  :columns => params[:columns] || 80,
                  :slug => slug,
                  :ip_address => env['HTTP_X_REAL_IP'] || env['REMOTE_ADDR'])


    render :text => 'https://showterm.herokuapp.com/' + CGI.escape(slug)
  end

  def view
    @script = Script.find_by_slug(params[:slug])
  end

  def index
  end
end
