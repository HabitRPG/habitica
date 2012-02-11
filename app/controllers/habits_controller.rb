class HabitsController < ApplicationController
  
  before_filter :authenticate_user!
  
  def index
    @user = current_user
    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @user }
    end
  end
  
  def new
    render :json => Habit.new
  end

  def edit
    render :json => current_user.habits.find(params[:id])
  end

  def create
    @habit = Habit.new(params[:habit])
    @habit.position ||= (Habit.maximum('position') || 0) + 1
    @habit.user_id = current_user.id

    respond_to do |format|
      if @habit.save
        format.json { render json: @habit, status: :created, location: @habit }
      else
        format.json { render json: @habit.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    @habit = current_user.habits.find(params[:id])
    if (params[:habit][:user_stats])
      user_stats = params[:habit].delete('user_stats')
      @habit.user.update_attributes({:lvl => user_stats['lvl'], :exp => user_stats['exp'], :money => user_stats['money']})
    end

    respond_to do |format|
      if @habit.update_attributes(params[:habit])
        format.json { head :no_content }
      else
        format.json { render json: @habit.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @habit = current_user.habits.find(params[:id])
    @habit.destroy

    respond_to do |format|
      format.json { head :no_content }
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
