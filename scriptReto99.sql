CREATE DATABASE reto99;
use reto99;

CREATE TABLE ubicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    latitud DECIMAL(9,6),
    longitud DECIMAL(9,6),
    altitud INT
);

INSERT INTO ubicaciones (nombre, latitud, longitud, altitud) VALUES
('Bilbao', 43.2630, -2.9350, 19),
('Vitoria-Gasteiz', 42.8467, -2.6716, 525),
('Donostia / San Sebastián', 43.3128, -1.9748, 6),
('Barakaldo', 43.2956, -2.9972, 39),
('Getxo', 43.3569, -3.0116, 50),
('Portugalete', 43.3204, -3.0197, 20),
('Irun', 43.3381, -1.7890, 10),
('Basauri', 43.2386, -2.8852, 70),
('Durango', 43.1704, -2.6336, 121),
('Eibar', 43.1849, -2.4713, 121);


CREATE TABLE tiempo_actual (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_ubicacion INT NOT NULL,
    fecha_hora DATETIME NOT NULL,
    temperatura DECIMAL(5,2),
    humedad DECIMAL(5,2),
    viento_velocidad DECIMAL(5,2),
    viento_direccion VARCHAR(10),
    precipitacion DECIMAL(5,2),
    FOREIGN KEY (id_ubicacion) REFERENCES ubicaciones(id)
);


CREATE TABLE historico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_ubicacion INT NOT NULL,
    fecha_hora DATETIME NOT NULL,
    temperatura DECIMAL(5,2),
    humedad DECIMAL(5,2),
    viento_velocidad DECIMAL(5,2),
    viento_direccion VARCHAR(10),
    precipitacion DECIMAL(5,2),
    FOREIGN KEY (id_ubicacion) REFERENCES ubicaciones(id)
);


CREATE TABLE prediccion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_ubicacion INT NOT NULL,
    fecha DATE NOT NULL,
    temperatura_max DECIMAL(5,2),
    temperatura_min DECIMAL(5,2),
    prob_precipitacion DECIMAL(5,2),
    descripcion VARCHAR(255),
    FOREIGN KEY (id_ubicacion) REFERENCES ubicaciones(id)
);


select * from ubicaciones;
select * from tiempo_actual;
select * from historico;
select * from prediccion;
