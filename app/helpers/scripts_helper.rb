module ScriptsHelper

  # Output JSON suitable for putting in a <script> tag.
  #
  # The "/" character is escaped to avoid XSS of the form:
  #   val == "foo</script><script>alert('gotcha')"
  #
  # "\u2028" and "\u2029" are characters that are valid as literals in JSON,
  # but not in javascript: http://timelessrepo.com/json-isnt-a-javascript-subset
  def raw_json(val)
    raw(val.to_json.gsub("\u002f", "\\u002f")
                   .gsub("\u2028", "\\u2028")
                   .gsub("\u2029", "\\u2029"))
  end
end
