db.users.update({'flags.showTour':{$ne:false}},{$set:{'flags.tour.intro':0}},{multi:1})
db.users.update({'flags.showTour':false},{$set:{'flags.tour.intro':-1}},{multi:1})