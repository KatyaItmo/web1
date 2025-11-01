package main;

import java.util.ArrayList;
import java.util.List;

public class HistoryManager {
    private static List<Point> history = new ArrayList<>();
    
    public static synchronized void addPoint(Point point) {
        history.add(point);
    }
    
    public static synchronized List<Point> getHistory() {
        return new ArrayList<>(history);
    }
    
    public static synchronized void clearHistory() {
        history.clear();
    }
}
