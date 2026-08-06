
import java.util.*;

// ======================= MODEL : EDGE ==========================
class Edge {
    public String destination;
    public int distance;

    public Edge(String destination, int distance) {
        this.destination = destination;
        this.distance = distance;
    }
}


// ======================= GRAPH MODULE ==========================
class Graph {

    private Map<String, List<Edge>> adjList = new HashMap<>();

    public void addCity(String city) {
        adjList.putIfAbsent(city, new ArrayList<>());
    }

    public void addRoute(String src, String dest, int distance) {
        adjList.putIfAbsent(src, new ArrayList<>());
        adjList.putIfAbsent(dest, new ArrayList<>());
        adjList.get(src).add(new Edge(dest, distance));
    }

    public Map<String, List<Edge>> getAdjList() {
        return adjList;
    }
}


// ======================= DIJKSTRA ALGORITHM ==========================
class Dijkstra {

    public static Map<String, Integer> shortestPath(Graph graph, String start) {

        Map<String, List<Edge>> adj = graph.getAdjList();
        Map<String, Integer> dist = new HashMap<>();

        for (String city : adj.keySet()) {
            dist.put(city, Integer.MAX_VALUE);
        }

        dist.put(start, 0);

        PriorityQueue<String> pq =
                new PriorityQueue<>(Comparator.comparingInt(dist::get));

        pq.add(start);

        while (!pq.isEmpty()) {
            String current = pq.poll();

            for (Edge edge : adj.get(current)) {

                int newDist = dist.get(current) + edge.distance;

                if (newDist < dist.get(edge.destination)) {
                    dist.put(edge.destination, newDist);
                    pq.add(edge.destination);
                }
            }
        }
        return dist;
    }
}


// ======================= ROUTE MANAGER SERVICE ==========================
class RouteManager {

    private Graph graph;

    public RouteManager(Graph graph) {
        this.graph = graph;
    }

    public void addFlight(String src, String dest, int distance) {
        graph.addRoute(src, dest, distance);
    }

    public Map<String, Integer> getShortestRoutes(String source) {
        return Dijkstra.shortestPath(graph, source);
    }
}


// ======================= MAIN APPLICATION ==========================
public class Main {

    public static void main(String[] args) {

        Graph graph = new Graph();
        RouteManager manager = new RouteManager(graph);

        // Add Cities
        graph.addCity("Delhi");
        graph.addCity("Mumbai");
        graph.addCity("Chennai");
        graph.addCity("Kolkata");

        // Add Routes
        manager.addFlight("Delhi", "Mumbai", 1400);
        manager.addFlight("Delhi", "Kolkata", 1500);
        manager.addFlight("Mumbai", "Chennai", 1300);
        manager.addFlight("Kolkata", "Chennai", 1600);
        manager.addFlight("Mumbai", "Kolkata", 2000);

        // Compute shortest routes from Delhi
        Map<String, Integer> shortest = manager.getShortestRoutes("Delhi");

        System.out.println("=== Shortest Flight Routes From Delhi ===");
        for (String city : shortest.keySet()) {
            System.out.println(city + " = " + shortest.get(city) + " km");
        }
    }
}
