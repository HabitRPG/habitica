class RewardsController < ApplicationController

  # GET /rewards/new
  # GET /rewards/new.json
  def new
    @reward = Reward.new
    @reward.user_id = current_user.id

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @reward }
    end
  end

  # GET /rewards/1/edit
  def edit
    @reward = current_user.rewards.find(params[:id])
  end

  # POST /rewards
  # POST /rewards.json
  def create
    @reward = Reward.new(params[:reward])
    @reward.user_id = current_user.id

    respond_to do |format|
      if @reward.save
        format.html { redirect_to habits_url, notice: 'Reward was successfully created.' }
        format.json { render json: @reward, status: :created, location: @reward }
      else
        format.html { render action: "new" }
        format.json { render json: @reward.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /rewards/1
  # PUT /rewards/1.json
  def update
    @reward = current_user.rewards.find(params[:id])

    respond_to do |format|
      if @reward.update_attributes(params[:reward])
        format.html { redirect_to habits_url, notice: 'Reward was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @reward.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /rewards/1
  # DELETE /rewards/1.json
  def destroy
    @reward = current_user.reward.find(params[:id])
    @reward.destroy

    respond_to do |format|
      format.html { redirect_to habits_url }
      format.json { head :no_content }
    end
  end
  
  
  def buy
    @reward = current_user.rewards.find(params[:id])
    @too_expensive = true
    if current_user.money > @reward.value
      current_user.money -= @reward.value
      current_user.save
      @too_expensive = false
    end
        
    respond_to do |format|
      # format.html { render action: "edit" }
      # format.json { render json: @habit.errors, status: :unprocessable_entity }
      format.js
    end
  end
  
  
end
