import csv

with open(r"/home/slappybag/Documents/SurveyScrape.csv") as f:
     reader = csv.reader(f, delimiter=',', quotechar='"')
     column = []
     for row in reader:
        if row:
            column.append(row[4])

print column