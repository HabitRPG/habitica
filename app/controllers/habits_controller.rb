class HabitsController < ApplicationController
  
  before_filter :authenticate_user!
  
  # GET /habits
  # GET /habits.json
  def index
    @habits = Habit.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @habits }
    end
  end

  # GET /habits/1
  # GET /habits/1.json
  def show
    @habit = Habit.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @habit }
    end
  end

  # GET /habits/new
  # GET /habits/new.json
  def new
    @habit = Habit.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @habit }
    end
  end

  # GET /habits/1/edit
  def edit
    @habit = Habit.find(params[:id])
  end

  # POST /habits
  # POST /habits.json
  def create
    @habit = Habit.new(params[:habit])

    respond_to do |format|
      if @habit.save
        format.html { redirect_to @habit, notice: 'Habit was successfully created.' }
        format.json { render json: @habit, status: :created, location: @habit }
      else
        format.html { render action: "new" }
        format.json { render json: @habit.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /habits/1
  # PUT /habits/1.json
  def update
    @habit = Habit.find(params[:id])

    respond_to do |format|
      if @habit.update_attributes(params[:habit])
        format.html { redirect_to @habit, notice: 'Habit was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @habit.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /habits/1
  # DELETE /habits/1.json
  def destroy
    @habit = Habit.find(params[:id])
    @habit.destroy

    respond_to do |format|
      format.html { redirect_to habits_url }
      format.json { head :no_content }
    end
  end
end
