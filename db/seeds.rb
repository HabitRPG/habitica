# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

lefnire = User.create!(email: "tylerrenelle@gmail.com", password: "root", password_confirmation: "root")
Habit.create!([
  { name: "Focus", score: 8, position: 0, user_id: lefnire.id, notes: "(-1) 15m procrastination
(+1) Pomorodo" },
  { name: "Diet", score: 4, position: 1, user_id: lefnire.id, notes: "(+2) Broccoli
(+1) Veggie / Fruit
--------------
(-1) Bad food
(-2) Bad meal" },
  { name: "Gawk",             score: 2, position: 2, user_id: lefnire.id },
  { name: "Insult Self",      score: 0, position: 3, user_id: lefnire.id },
  { name: "Negative Talk",    score: 0, position: 4, user_id: lefnire.id },
  { name: "Exaggeration",     score: -1, position: 5, user_id: lefnire.id },
  { name: "Nail-biting",      score: 0, position: 6, user_id: lefnire.id },
  { name: "Temptation Control", score: 0, position: 7, down: false, user_id: lefnire.id, notes: "* meditate for 1 minute, visualize
* positive, specific, present self-talk
* do first task" },
  { name: "Posture",          score: 0, position: 8, down: false, user_id: lefnire.id },
  { name: "Smile/eye-gaze",   score: 0, position: 9, down: false, user_id: lefnire.id },
  { name: "Propose, not ask", score: 0, position: 10, down: false, user_id: lefnire.id },
  { name: "Coffee", score: -3, position: 11, down: false, user_id: lefnire.id, notes: "(1x Coffee, 2x Tea)"},
  
  # Morning
  { name: "TMJ Exercise", score: 2, position: 12, habit_type: 2, user_id: lefnire.id },
  { name: "N-Back (10m)", score: 4, position: 13, habit_type: 2, user_id: lefnire.id },
  { name: "Anki",         score: -1, position: 14, habit_type: 2, user_id: lefnire.id },

  # Work
  { name: "First task of the day",  score: 2, position: 15, habit_type: 2, user_id: lefnire.id },
  { name: "Google News",            score: 5, position: 16, habit_type: 2, user_id: lefnire.id },
  { name: "Mint",                   score: 5, position: 17, habit_type: 2, user_id: lefnire.id },
  { name: "Anki (new card)",        score: 0, position: 18, habit_type: 2, user_id: lefnire.id },
  { name: "Anki (marked/suspended)",  score: 0, position: 19, habit_type: 2, user_id: lefnire.id },
  { name: "TODO",                   score: 3, position: 20, habit_type: 2, user_id: lefnire.id },
  { name: "Exercise",               score: 0, position: 21, habit_type: 2, user_id: lefnire.id },
      
  # Night 
  { name: "Lumosity",       score: 1, position: 22, habit_type: 2, user_id: lefnire.id },
  { name: "N-Back (10m)",   score: -2, position: 23, habit_type: 2, user_id: lefnire.id },
  { name: "Brain (15m)",    score: 0, position: 24, habit_type: 2, user_id: lefnire.id },
  { name: "First task of the night",  score: 1, position: 25, habit_type: 2, user_id: lefnire.id },
  { name: "Project (30m)",  score: 5, position: 26, habit_type: 2, user_id: lefnire.id },
  { name: "Visualization",  score: -4, position: 27, habit_type: 2, user_id: lefnire.id },
    
  # Sunday  
  # { name: "Meetup (review & pick)",  score: -1, position: 28, habit_type: 2, user_id: lefnire.id },
  ])

