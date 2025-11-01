package main;

public class Point {
    private String x;
    private String y;
    private String r;
    private boolean hit;
    private String requestTime;
    private double executionTime;
    
    public Point(String x, String y, String r, boolean hit, String requestTime, double executionTime) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.hit = hit;
        this.requestTime = requestTime;
        this.executionTime = executionTime;
    }
    
    // Геттеры
    public String getX() { return x; }
    public String getY() { return y; }
    public String getR() { return r; }
    public boolean isHit() { return hit; }
    public String getRequestTime() { return requestTime; }
    public double getExecutionTime() { return executionTime; }
    
    // Сеттеры
    public void setX(String x) { this.x = x; }
    public void setY(String y) { this.y = y; }
    public void setR(String r) { this.r = r; }
    public void setHit(boolean hit) { this.hit = hit; }
    public void setRequestTime(String requestTime) { this.requestTime = requestTime; }
    public void setExecutionTime(double executionTime) { this.executionTime = executionTime; }
}
