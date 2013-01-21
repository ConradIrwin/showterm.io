module RecordHelper
  def upload_base_url
    request.base_url.sub("http://", '').sub("record.", "")
  end

  def record_base_url
    base = request.base_url.sub("http://", '')
    base += "/record" unless base =~ /record/
    base
  end
end
