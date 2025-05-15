package com.ejemplo.visor.model;

public class Tiempo {
    private String ciudad;
    private double temperatura;
    private int humedad;
    private String estado;

    public Tiempo(String ciudad, double temperatura, int humedad, String estado) {
        this.ciudad = ciudad;
        this.temperatura = temperatura;
        this.humedad = humedad;
        this.estado = estado;
    }

    // Getters (y setters si necesitas)
    public String getCiudad() { return ciudad; }
    public double getTemperatura() { return temperatura; }
    public int getHumedad() { return humedad; }
    public String getEstado() { return estado; }
}
