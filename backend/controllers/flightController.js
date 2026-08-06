const City = require('../models/City');
const Route = require('../models/Route');

// Get all cities
exports.getCities = async (req, res) => {
    try {
        const cities = await City.find().sort({ name: 1 });
        res.json(cities);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cities', error: error.message });
    }
};

// Add a city
exports.addCity = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'City name is required' });

        const newCity = new City({ name });
        await newCity.save();
        res.status(201).json(newCity);
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ message: 'City already exists' });
        res.status(500).json({ message: 'Error adding city', error: error.message });
    }
};

// Get all routes
exports.getRoutes = async (req, res) => {
    try {
        const routes = await Route.find();
        res.json(routes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching routes', error: error.message });
    }
};

// Add a route
exports.addRoute = async (req, res) => {
    try {
        const { source, destination, distance } = req.body;
        if (!source || !destination || !distance) {
            return res.status(400).json({ message: 'Source, destination, and distance are required' });
        }
        
        // Ensure both cities exist
        const srcCity = await City.findOne({ name: source });
        const destCity = await City.findOne({ name: destination });
        
        if (!srcCity || !destCity) {
            return res.status(400).json({ message: 'Both cities must exist before creating a route' });
        }

        const newRoute = new Route({ source, destination, distance });
        await newRoute.save();
        res.status(201).json(newRoute);
    } catch (error) {
        res.status(500).json({ message: 'Error adding route', error: error.message });
    }
};

// Dijkstra Algorithm Implementation
exports.optimizeRoute = async (req, res) => {
    try {
        const { source, destination } = req.query;
        if (!source || !destination) {
            return res.status(400).json({ message: 'Source and destination query params are required' });
        }

        const cities = await City.find();
        const routes = await Route.find();

        if (cities.length === 0) {
            return res.status(404).json({ message: 'No cities available in the network.' });
        }

        const adjList = {};
        cities.forEach(city => {
            adjList[city.name] = [];
        });

        routes.forEach(route => {
            if (adjList[route.source]) {
                adjList[route.source].push({ node: route.destination, weight: route.distance });
            }
        });

        const distances = {};
        const previous = {};
        const unvisited = new Set();

        cities.forEach(city => {
            distances[city.name] = Infinity;
            previous[city.name] = null;
            unvisited.add(city.name);
        });

        distances[source] = 0;

        while (unvisited.size > 0) {
            let current = null;
            let minDistance = Infinity;

            for (const node of unvisited) {
                if (distances[node] < minDistance) {
                    minDistance = distances[node];
                    current = node;
                }
            }

            if (current === null) break; 
            if (current === destination) break;

            unvisited.delete(current);

            if (adjList[current]) {
                for (const neighbor of adjList[current]) {
                    if (unvisited.has(neighbor.node)) {
                        const newDistance = distances[current] + neighbor.weight;
                        if (newDistance < distances[neighbor.node]) {
                            distances[neighbor.node] = newDistance;
                            previous[neighbor.node] = current;
                        }
                    }
                }
            }
        }

        if (distances[destination] === Infinity) {
            return res.status(404).json({ message: 'No route found between the specified cities.' });
        }

        const path = [];
        let currNode = destination;
        while (currNode !== null) {
            path.unshift(currNode);
            currNode = previous[currNode];
        }

        res.json({
            source,
            destination,
            totalDistance: distances[destination],
            path
        });

    } catch (error) {
        res.status(500).json({ message: 'Error computing optimal route', error: error.message });
    }
};

exports.seedInitialData = async (req, res) => {
    try {
        await City.deleteMany();
        await Route.deleteMany();

        const cities = ["Delhi", "Mumbai", "Chennai", "Kolkata"];
        for (const cityName of cities) {
            await new City({ name: cityName }).save();
        }

        const routes = [
            { source: "Delhi", destination: "Mumbai", distance: 1400 },
            { source: "Delhi", destination: "Kolkata", distance: 1500 },
            { source: "Mumbai", destination: "Chennai", distance: 1300 },
            { source: "Kolkata", destination: "Chennai", distance: 1600 },
            { source: "Mumbai", destination: "Kolkata", distance: 2000 }
        ];

        for (const route of routes) {
            await new Route(route).save();
        }

        res.json({ message: 'Initial data seeded successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error seeding data', error: error.message });
    }
};
