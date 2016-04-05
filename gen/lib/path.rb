require 'pathname'

module Path
  def ancestor(leaf, dir)
    path = Pathname.new(leaf)
    until path.to_s.ends_with?(dir)
      path = path.parent
    end

    path.to_s
  end

  def cousin(me, common, them)
    x = ancestor(me, common)
    "#{x}/#{them}"
  end
end
