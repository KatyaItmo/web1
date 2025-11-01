package main;

public class AreaChecker {
    
    public static boolean validatePoint(String xStr, String yStr, String rStr) {
        try {
            double x = Double.parseDouble(xStr.replace(",", "."));
            double y = Double.parseDouble(yStr.replace(",", "."));
            double r = Double.parseDouble(rStr.replace(",", "."));
            
            if (x < -3 || x > 5) return false;
            if (y < -3 || y > 3) return false;
            if (r < 1 || r > 3) return false;
            
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }
    
    public static boolean checkHit(String xStr, String yStr, String rStr) {
        try {
            double x = Double.parseDouble(xStr.replace(",", "."));
            double y = Double.parseDouble(yStr.replace(",", "."));
            double r = Double.parseDouble(rStr.replace(",", "."));
            
            // 1-я четверть: четверть круга радиусом R/2
            if (x >= 0 && y >= 0) {
                return (x * x + y * y) <= (r/2 * r/2);
            }
            
            // 2-я четверть: треугольник
            if (x <= 0 && y >= 0) {
                return (y <= (r/2 + (r/2) * x / r));
            }
            
            // 3-я четверть: прямоугольник
            if (x <= 0 && y <= 0) {
                return (x >= -r/2) && (y >= -r);
            }
            
            // 4-я четверть: нет области
            return false;
            
        } catch (Exception e) {
            return false;
        }
    }
}
