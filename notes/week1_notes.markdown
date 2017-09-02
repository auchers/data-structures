Thoughts on Parsing

Hypothesis:
each doc has 3 tables
take the 3rd tables
then has x number of table rows 'tr'
    ignore the first since it is the heading, but the rest should be event rows
for each row after the first take the first 'b' -- that will be the title of the event
    (remaining 'b's are the days of the week)