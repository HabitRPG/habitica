desc "This task is called by the Heroku scheduler add-on"
task :clear_done => :environment do
    puts "Clearing users' completed daily tasks, and docking points for incompletes..."
    Habit.clear_done
    puts "done."
end