# Photon Sensor Data

In this project, we were each given [Particle Photon sensor](https://www.particle.io/) and 2 sensors (accelerometer and hall) and had to set them up to collect 1 month's worth of usable data. Mine was set up to record refrigerator activity with the accelerometer measuring the door's movement and the hall senser measuring when the door was opened or closed (it relation to a magnet affixed to the side).

The final API endpoint for the month's worth of data can be found [here](https://github.com/auchers/data-structures/tree/master/final_assignment/sensors).

Specifications about how the data is intended to be displayed can be found [here]((https://github.com/auchers/data-structures/tree/master/final_assignment/sensors/dataVisualizationModel.pdf) ). 

## Project Specifications:

* programming a [Particle Photon sensor](https://www.particle.io/) utilizing accelerometer and hall (magnetic) sensors.
* setting up sensor to collect 1 months worth of data (recording refrigerator activity).
* designing data model to store sensor readings
* built, maintain and interface with Amazon RDS. 
* create API [endpoint](http://ec2-18-216-148-3.us-east-2.compute.amazonaws.com:4000) on Amazon EC2 server to get sensor readings
* connect sensor data to a prototyped [user interface tracking](https://github.com/auchers/data-structures/tree/master/final_assignment/sensors/dataVisualizationModel.pdf) refrigerator usage.
