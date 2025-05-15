CREATE DATABASE reto99;
use reto99;

CREATE TABLE ubicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    latitud DECIMAL(9,6),
    longitud DECIMAL(9,6),
    altitud INT
);


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
