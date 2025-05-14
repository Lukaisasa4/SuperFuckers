package aemet;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class AemetClient {
    private String apiKey;

    public AemetClient(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getWeatherData(String stationId) throws IOException, InterruptedException {
        String url = "https://opendata.aemet.es/opendata/api/observacion/convencional/datos/estacion/" + stationId + "/?api_key=" + apiKey;

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        return response.body();
    }
}
