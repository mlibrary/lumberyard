# Copyright (c) 2017 The Regents of the University of Michigan.
# All Rights Reserved. Licensed according to the terms of the Revised
# BSD License. See LICENSE.txt for details.
require 'inifile'

ExampleConfig = "\
matt = pretty cool
is matt cool = true

[wrong]
matt = not cool
is matt cool = false

[yes]
matt = heck of cool
;is matt cool = false

[alternative-booleans]
lightbulb = on
"

RSpec::describe IniFile, " # learning" do
  before :each do
    @ini = IniFile.new(:content => ExampleConfig)
  end

  it "globally knows that matt is pretty cool" do
    expect(@ini['global']['matt']).to eq('pretty cool')
  end

  it "converts 'true' to a boolean" do
    expect(@ini['global']['is matt cool']).to eq(true)
  end

  it "overrides its globals with [wrong]" do
    expect(@ini['wrong']['matt']).to eq('not cool')
    expect(@ini['wrong']['is matt cool']).to eq(false)
  end

  it "has a [yes] section which lacks the boolean" do
    expect(@ini['yes']['matt']).to eq('heck of cool')
    expect(@ini['yes']).not_to include('is matt cool')
  end

  it "doesn't recognize 'on' as true" do
    expect(@ini['alternative-booleans']['lightbulb']).to eq("on")
  end
end
