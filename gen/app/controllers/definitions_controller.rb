require 'java'
require 'json'

require_relative '../../lib/gnuprologjava-0.2.5.jar'
require_relative '../../lib/path'

FILENAME = File.expand_path(__FILE__)

class DefinitionsController < ActionController::Base
  # GET /definitions
  def index
    @definitions = Definition.all
  end

  # GET /definitions/1
  def show
    @definition = Definition.find(params[:id])

    env = Java::GnuPrologVm::Environment.new
    env.ensureLoaded(
      Java::GnuPrologTerm::AtomTerm.get(
        Path.cousin(FILENAME, 'gen', 'lib/predicates.pl')
      )
    )

    variables = @definition.variables
      .split(',')
      .map{|v| Java::GnuPrologTerm::VariableTerm.new(v)}
    constants = @definition.constants
      .split(',')
      .map{|c| Java::GnuPrologTerm::VariableTerm.new(c)}
    termlist = (variables + constants).to_java Java::GnuPrologTerm::Term

    # TODO
    #@definition.constraints.each do |constraint|
    #  case constraint['type']
    #  end
    #end
  end

  # GET /definitions/new
  def new
    @definition = Definition.new
    @constraints = []
  end

  # GET /definitions/1/edit
  def edit
    @definition = Definition.find(params[:id])
    @constraints = JSON.parse(@definition.constraints).map do |constraint|
      case constraint['type']
      when 'equals'
        type = 0
      when 'lt'
        type = 1
      when 'gt'
        type = 2
      when 'lteq'
        type = 3
      when 'gteq'
        type = 4
      when 'divisible'
        type = 5
      when 'factor'
        type = 6
      when 'decimal'
        type = 7
      end

      {:type => type, :args => constraint['args']}
    end
  end

  # POST /definitions
  def create
    @definition = self.definition_from_form_data(params)
    if @definition.save
      redirect_to @definition, notice: 'Definition was successfully created.'
    else
      render :new
    end
  end

  # PATCH/PUT /definitions/1
  def update
    definition = self.definition_from_form_data(params)
    definition.id = params[:id]
    if @definition.save
      redirect_to @definition, notice: 'Definition was successfully updated.'
    else
      render :edit
    end
  end

  # DELETE /definitions/1
  def destroy
    @definition = Definition.find(params[:id])
    @definition.destroy
    redirect_to definitions_url, notice: 'Definition was successfully destroyed.'
  end

  def definition_from_form_data(params)
    constraints = []
    10.times do |i|
      arg0 = params["constraint_#{i}_0"]
      arg1 = params["constraint_#{i}_1"]
      args = [arg0, arg1].select {|arg| not arg.blank?}
      break if args.length == 0
      case params["constraint_#{i}_type"]
      when '0'
        type = 'equals'
      when '1'
        type = 'lt'
      when '2'
        type = 'gt'
      when '3'
        type = 'lteq'
      when '4'
        type = 'gteq'
      when '5'
        type = 'divisible'
      when '6'
        type = 'factor'
      when '7'
        type = 'decimal'
      end

      constraints << {:type => type, :args => args}
    end

    Definition.new(
      fmt: params[:definition][:fmt],
      constraints: JSON.fast_generate(constraints)
    )
  end
end
