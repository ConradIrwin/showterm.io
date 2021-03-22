class ScriptsController < ApplicationController
  respond_to :html, :json, :xml
  before_filter :load_script, only: [:view, :destroy]
  skip_before_action :verify_authenticity_token, if: :json_request?

  def create

    # prevent DoubleRenderError when either scriptfile or timingfile may be empty
    unless params[:scriptfile]
      render :text => 'No scriptfile given', :status => 400
      return
    end

    unless params[:timingfile]
      render :text => 'No timingfile given', :status => 400
      return
    end

    slug = Digest::SHA1.hexdigest([params[:scriptfile], params[:timingfile]].inspect)[0..20]

    Script.create(:scriptfile => params[:scriptfile],
                  :timingfile => params[:timingfile],
                  :cols => (params[:cols] || 80).to_i,
                  :lines => params[:lines],
                  :secret => params[:secret],
                  :slug => slug,
                  :ip_address => env['HTTP_X_REAL_IP'] || env['REMOTE_ADDR'])

    render :text => "#{base_address}/#{CGI.escape(slug)}"
  end

  def base_address
    if request.base_url == "https://showterm.herokuapp.com"
      "http://showterm.io"
    else
      request.base_url
    end
  end

  def view
    response.headers.except! 'X-Frame-Options'

    respond_with @script do |format|
      format.json {
        if params[:callback]
          render :json => @script.to_json, :callback => params[:callback], :content_type => 'text/javascript'
        else
          render :json => @script.to_json
        end
      }
    end
  end

  def index
  end

  def destroy
    unless @script
      render :text => "No such script", status: 404
      return
    end

    unless @script.secret
      render :text => "This script is too old to delete, email me@cirw.in for help.", status: 400
      return
    end

    unless String === params[:secret]
      render :text => "Must provide ?secret= to delete a script", status: 400
      return
    end

    unless SecureEquals.equal? @script.secret, params[:secret]
      render :text => "This script was uploaded from a different computer", status: 401
      return
    end

    @script.destroy
    render :text => "Deleted #{base_address}/#{CGI.escape(@script.slug)}"
  end

  private

  def json_request?
    request.format.json?
  end

  def load_script
    @script = Script.find_by_slug(params[:slug])
  end
end
