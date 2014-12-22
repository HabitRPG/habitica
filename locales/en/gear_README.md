To maintain consistency in equipment descriptions, the following guidelines have been proposed (https://github.com/HabitRPG/habitrpg-shared/pull/372):

#### Order of elements:
1. Description.
2. Stat Effect.
3. Event/Origin(if needed)

#### Stat Effect
Examples of wording:
* No bonus:
* Confers no benefit.
* Single or all stat bonus:
* Increases (Strength/Intelligence/Constitution/Perception/all attributes) by (<%= str %>/<%= int %>/<%= con %>/<%= per %>/<%= attrs %>).
* Two stats, same bonus:
* Increases (Strength/Intelligence/Constitution) and (Intelligence/Constitution/Perception) by <%= attrs %> each.
* Two stats, different bonus
* Increases (Strength/Intelligence/Constitution) by (<%= str %>/<%= int %>/<%= con %>) and (Intelligence/Constitution/Perception) by (<%= int %>/<%= con %>/<%= per %>)].

Long form:
* Confers no benefit. / Increases (Strength/Intelligence/Constitution/Perception/all attributes) [and (Intelligence/Constitution/Perception)] by (<%= str %>/<%= int %>/<%= con %>/<%= per %>/<%= attrs %>) [each/and (Intelligence/Constitution/Perception) by (<%= int %>/<%= con %>/<%= per %>)].

#### Event/Origin:
Examples of wording:
* (Month) (Year) Subscriber Item.
* Limited Edition (Year) (Season) Gear.
