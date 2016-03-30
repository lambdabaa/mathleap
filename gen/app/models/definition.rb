class Definition < ActiveRecord::Base
  before_save do
    self.constants = self.fmt.chars
      .select {|c| /[A-Z]/.match(c)}
      .join(',')
    self.variables = self.fmt.chars
      .select {|c| /[a-z]/.match(c)}
      .join(',')
  end
end
