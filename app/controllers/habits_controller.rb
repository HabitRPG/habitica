class HabitsController < ApplicationController
  
  before_filter :authenticate_user!
  
  # GET /habits
  # GET /habits.json
  def index
    @habits = current_user.habits.where(:habit_type => Habit::ALWAYS)
    @daily = current_user.habits.where(:habit_type => Habit::DAILY)
    @one_time = current_user.habits.where(:habit_type => Habit::ONE_TIME).where(:done=>false)
    @rewards = current_user.rewards

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @habits }
    end
  end
  
  # GET /habits/completed
  # GET /habits/completed.json
  def completed
    @one_time = current_user.habits.where(:habit_type => Habit::ONE_TIME).where(:done=>true)

    respond_to do |format|
      format.html # completed.html.erb
      format.json { render json: @one_time }
    end
  end


  # GET /habits/new
  # GET /habits/new.json
  def new
    @habit = Habit.new
    @habit.position = (Habit.maximum('position') || 0) + 1

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @habit }
    end
  end

  # GET /habits/1/edit
  def edit
    @habit = current_user.habits.find(params[:id])
  end

  # POST /habits
  # POST /habits.json
  def create
    @habit = Habit.new(params[:habit])
    @habit.user_id = current_user.id

    respond_to do |format|
      if @habit.save
        format.html { redirect_to habits_url, notice: 'Habit was successfully created.' }
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
    @habit = current_user.habits.find(params[:id])

    respond_to do |format|
      if @habit.update_attributes(params[:habit])
        format.html { redirect_to habits_url, notice: 'Habit was successfully updated.' }
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
    @habit = current_user.habits.find(params[:id])
    @habit.destroy

    respond_to do |format|
      format.html { redirect_to habits_url }
      format.json { head :no_content }
    end
  end
  
  def vote
    @habit = current_user.habits.find(params[:id])
    
    # habit.vote() saves money to the user, this hack prevents having to
    # reload current_user to catch that change
    @habit.user=current_user
    
    @habit.vote(params[:vote])
        
    respond_to do |format|
      # format.html { render action: "edit" }
      # format.json { render json: @habit.errors, status: :unprocessable_entity }
      format.js
    end
  end
  
  def sort
    current_user.habits.each do |habit|
      logger.fatal params['habit'].index(habit.id.to_s)
      habit.position = params['habit'].index(habit.id.to_s)
      habit.save
    end
    render :nothing => true
  end
end
