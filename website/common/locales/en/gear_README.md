# Style Guide for Equipment Descriptions

To maintain consistency in equipment descriptions, the following guidelines have been proposed (https://github.com/HabitRPG/habitrpg-shared/pull/372):

## Order of elements
1. Description
2. Stat Effect
3. Event/Origin (if needed)

## Stat Effect
* **No bonus:**
"Confers no benefit."
* **Single or all stat bonus:**
"Increases (Strength/Intelligence/Constitution/Perception/all attributes) by (<%= str %>/<%= int %>/<%= con %>/<%= per %>/<%= attrs %>)."
* **Two stats, same bonus:**
"Increases (Strength/Intelligence/Constitution) and (Intelligence/Constitution/Perception) by <%= attrs %> each."
* **Two stats, different bonus:**
"Increases (Strength/Intelligence/Constitution) by (<%= str %>/<%= int %>/<%= con %>) and (Intelligence/Constitution/Perception) by (<%= int %>/<%= con %>/<%= per %>)]."

## Event/Origin
Examples of wording:
* "[Month] [Year] Subscriber Item." (_e.g., "November 2014 Subscriber Item."_)
* "Limited Edition [Year] [Season] Gear." (_e.g., "Limited Edition 2014 Spring Gear."_)
