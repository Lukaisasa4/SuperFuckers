package com.ejemplo.visor.controller;

import com.ejemplo.visor.model.Tiempo;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tiempo")
@CrossOrigin(origins = "*") // para permitir llamadas desde el frontend
public class TiempoController {

    @GetMapping
    public Tiempo obtenerTiempo(@RequestParam String ciudad) {
        // Aquí normalmente irías a la API AEMET o la base de datos.
        // De momento, devolvemos datos de prueba:
        return new Tiempo(ciudad, 21.5, 60, "Despejado");
    }
}
