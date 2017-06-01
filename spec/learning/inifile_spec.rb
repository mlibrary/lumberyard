# Copyright (c) 2017 The Regents of the University of Michigan.
# All Rights Reserved. Licensed according to the terms of the Revised
# BSD License. See LICENSE.txt for details.
require 'inifile'

ExampleConfig = "[global]
matt = pretty cool
is matt cool = true

[wrong]
matt = not cool
is matt cool = false

[yes]
matt = heck of cool
"

RSpec::describe IniFile do
  before :each do
    @ini = IniFile.new(:content => ExampleConfig)
  end

  it "globally knows that matt is pretty cool" do
    expect(@ini['global']['matt']).to eq('pretty cool')
  end
end
