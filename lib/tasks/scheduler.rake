desc "This task is called by the Heroku scheduler add-on"
task :clear_done => :environment do
    Rails.logger.info "Clearing users' completed daily tasks, and docking points for incompletes."
    Habit.clear_done
end