package main;

import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fastcgi.FCGIInterface;

public class FastCGIServer {
    
    public static void main(String[] args) {
        try {
            String portStr = System.getProperty("FCGI_PORT", "24019");
            int port = Integer.parseInt(portStr);
            
            FCGIInterface fcgiInterface = new FCGIInterface();
            
            System.err.println("FastCGI Server started on port " + port);
            System.err.println("Waiting for FastCGI requests...");
            
            while (fcgiInterface.FCGIaccept() >= 0) {
                try {
                    String method = FCGIInterface.request.params.getProperty("REQUEST_METHOD");
                    String queryString = FCGIInterface.request.params.getProperty("QUERY_STRING", "");
                    String contentLengthStr = FCGIInterface.request.params.getProperty("CONTENT_LENGTH", "0");
                    
                    System.err.println("Processing " + method + " request, query: " + queryString);
                    
                    if ("GET".equals(method)) {
                        if (queryString.contains("action=clear")) {
                            HistoryManager.clearHistory();
                            sendResponse(200, "OK", "application/json", "{\"status\":\"History cleared\"}");
                        } else {
                            String historyJson = buildHistoryJson();
                            sendResponse(200, "OK", "application/json", historyJson);
                        }
                        continue;
                    }
                    
                    if ("POST".equals(method)) {
                        int contentLength = Integer.parseInt(contentLengthStr);
                        if (contentLength > 0) {
                            byte[] body = new byte[contentLength];
                            System.in.read(body);
                            String formData = new String(body, StandardCharsets.UTF_8);
                            
                            System.err.println("Raw form data: " + formData);
                            
                            String result = processPoints(formData);
                            sendResponse(200, "OK", "application/json", result);
                        } else {
                            sendResponse(400, "Bad Request", "application/json", 
                                       "{\"error\":\"Empty request body\"}");
                        }
                        continue;
                    }
                    
                    sendResponse(405, "Method Not Allowed", "application/json", 
                               "{\"error\":\"Method not allowed\"}");
                    
                } catch (Exception e) {
                    System.err.println("Error processing request: " + e.getMessage());
                    e.printStackTrace();
                    sendResponse(500, "Internal Server Error", "application/json", 
                               "{\"error\":\"Server error: " + e.getMessage() + "\"}");
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to start FastCGI server: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private static String processPoints(String formData) {
        Map<String, List<String>> params = parseFormData(formData);
        
        List<String> xValues = params.get("x");
        List<String> yValues = params.get("y");
        List<String> rValues = params.get("r");
        
        if (xValues == null || yValues == null || rValues == null) {
            return "{\"error\":\"Missing parameters\"}";
        }
        
        try {
            String originalX = xValues.get(0);
            String originalR = rValues.get(0);
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            
            System.err.println("Received - X: '" + originalX + "', R: '" + originalR + "', Y values: " + yValues);
            
            List<Point> currentResults = new ArrayList<>();
            
            for (String originalY : yValues) {
                System.err.println("Processing point - X: '" + originalX + "', Y: '" + originalY + "', R: '" + originalR + "'");
                
                if (!AreaChecker.validatePoint(originalX, originalY, originalR)) {
                    System.err.println("Point validation failed");
                    continue;
                }
                
                long startTime = System.nanoTime();
                boolean hit = AreaChecker.checkHit(originalX, originalY, originalR);
                long endTime = System.nanoTime();
                double executionTime = (endTime - startTime) / 1_000_000.0;
                
                Point result = new Point(originalX, originalY, originalR, hit, 
                                       dateFormat.format(new Date()), executionTime);
                
                System.err.println("Created point - X: '" + result.getX() + "', Hit: " + hit);
                
                currentResults.add(result);
                HistoryManager.addPoint(result);
            }
            
            String jsonResponse = buildResponseJson(currentResults);
            System.err.println("Sending JSON response: " + jsonResponse);
            return jsonResponse;
            
        } catch (Exception e) {
            System.err.println("Processing error: " + e.getMessage());
            return "{\"error\":\"Processing error: " + e.getMessage() + "\"}";
        }
    }
    
    private static Map<String, List<String>> parseFormData(String formData) {
        Map<String, List<String>> params = new HashMap<>();
        if (formData == null || formData.isEmpty()) {
            return params;
        }
        
        String[] pairs = formData.split("&");
        
        for (String pair : pairs) {
            String[] keyValue = pair.split("=", 2);
            if (keyValue.length != 2) continue;
            
            String key = keyValue[0];
            String value = keyValue[1];
            
            params.computeIfAbsent(key, k -> new ArrayList<>()).add(value
