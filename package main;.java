package main;

import aemet.AemetClient;
import utils.JsonParser;

import java.io.IOException;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("Introduce tu API Key de AEMET: ");
        String apiKey = scanner.nextLine();

        AemetClient client = new AemetClient(apiKey);

        System.out.print("Introduce el código de la estación meteorológica: ");
        String stationId = scanner.nextLine();

        try {
            String response = client.getWeatherData(stationId);
            JsonObject jsonResponse = JsonParser.parse(response);

            // Aquí puedes procesar y mostrar los datos de forma más detallada
            System.out.println("Datos meteorológicos: " + jsonResponse.toString());
        } catch (IOException | InterruptedException e) {
            System.out.println("Error al obtener los datos: " + e.getMessage());
        }
    }
}
