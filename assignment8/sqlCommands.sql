
CREATE TABLE accelerometer (
    x float,
    y float,
    z float,
    time timestamp DEFAULT current_timestamp
);

CREATE TABLE hall (
    is_Magnetized BOOLEAN,
    time timestamp DEFAULT current_timestamp
);

INSERT INTO accelerometer values (2,2,3,DEFAULT);
INSERT INTO accelerometer values (2,2,3,DEFAULT);
INSERT INTO accelerometer values (2,4,3,DEFAULT);

SELECT * from accelerometer;

INSERT INTO hall VALUES (FALSE, DEFAULT);
INSERT INTO hall VALUES (TRUE, DEFAULT);
INSERT INTO hall VALUES (TRUE, DEFAULT);

SELECT * from hall;