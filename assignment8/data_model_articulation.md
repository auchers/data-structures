# Data Model Articulation

My data model will consist of 2 tables, one for each of the sensors:

- accelerometer
- hall

For both of these I decided to collect data at the most raw level with the thought that I will always be able to 
aggregate to a higher level of abstraction at a later point. Ideally I would want to pull these from the sensor 
as often as possible and then, if needed, once a day/week, I can consolidate all the periods with no changes.

In the end, I will probably look more at changes between adjacent timestamps, but it will at least be useful to have 
the flexibility to see the initial values if I need them at a later point. 


## Accelerometer Table

Field | Type 
------|-----
x | float
y | float
z | float
time | timestamp

## Hall Table

Field | Type 
-----|-----
is_magnetized | boolean
time | timestamp