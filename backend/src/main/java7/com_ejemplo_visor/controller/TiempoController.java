package main.java7.com_ejemplo_visor.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import main.java7.com_ejemplo_visor.model.Tiempo;

@RestController
public class TiempoController {

    @GetMapping("/api/tiempo")
    public Tiempo obtenerTiempo(@RequestParam String ciudad) {
        switch (ciudad.trim().toLowerCase()) {
            case "bilbao":
                return new Tiempo("Bilbao", 18.2, 70, "Nublado");
            case "donostia":
                return new Tiempo("Donostia", 17.5, 75, "Lluvia débil");
            case "gasteiz":
                return new Tiempo("Gasteiz", 15.0, 60, "Despejado");
            case "iruñea":
                return new Tiempo("Iruñea", 16.8, 65, "Parcialmente nublado");
            case "baiona":
                return new Tiempo("Baiona", 19.1, 80, "Lluvia moderada");
            default:
                return new Tiempo(ciudad, 21.5, 60, "Despejado");
        }
    }
}