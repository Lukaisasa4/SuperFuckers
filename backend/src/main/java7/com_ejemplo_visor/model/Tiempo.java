package com.ejemplo_visor.model;

public class Tiempo {
    private String ciudad;
    private double temperatura;
    private int humedad;
    private String descripcion;

    // Constructor
    public Tiempo(String ciudad, double temperatura, int humedad, String descripcion) {
        this.ciudad = ciudad;
        this.temperatura = temperatura;
        this.humedad = humedad;
        this.descripcion = descripcion;
    }

    // Getters (y setters si los necesitas)
    public String getCiudad() {
        return ciudad;
    }

    public double getTemperatura() {
        return temperatura;
    }

    public int getHumedad() {
        return humedad;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
