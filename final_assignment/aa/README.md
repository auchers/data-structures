# Alcoholics Anonymous Meeting Data

This part of the final assignment was to take the Alcoholics Anonymous meeting data present in the files below, (a) to scrape them from their html structure, (b) to parse them and standardize informative elements and (c) to geocode them with latitude and longitude using the GoogleAPI.

Final map can be found [here](http://ec2-18-216-148-3.us-east-2.compute.amazonaws.com:4000/aa).

**Original Data:** 

        http://visualizedata.github.io/datastructures/data/m01.html  
        http://visualizedata.github.io/datastructures/data/m02.html  
        http://visualizedata.github.io/datastructures/data/m03.html  
        http://visualizedata.github.io/datastructures/data/m04.html  
        http://visualizedata.github.io/datastructures/data/m05.html  
        http://visualizedata.github.io/datastructures/data/m06.html  
        http://visualizedata.github.io/datastructures/data/m07.html  
        http://visualizedata.github.io/datastructures/data/m08.html  
        http://visualizedata.github.io/datastructures/data/m09.html  
        http://visualizedata.github.io/datastructures/data/m10.html  

## Contents of Repository


**Data:** Contains parsed and geocoded AA meeting files, with each file being one zone scraped from 1 of the links above. Here you can find both raw scrapped text files as well as the parsed and geocoded JSON files.

**text_parsing.js:** Script used to parse and geocode the meetings files. 

**mongo_insert.js:** Script used to insert cleaned up files into mongo database.