// Simple in-memory database for demo purposes
// In production, use MongoDB or another proper database

class InMemoryDB {
  constructor() {
    this.cabs = [];
    this.bookings = [];
    this.routes = [];
    this.cabIdCounter = 1;
    this.bookingIdCounter = 1;
    this.routeIdCounter = 1;
    
    // Initialize with some default data
    this.initializeData();
  }

  initializeData() {
    // Default cabs
    this.cabs = [
      {
        _id: '1',
        name: 'Economic Cab',
        pricePerMinute: 2.5,
        isActive: true,
        currentBookings: []
      },
      {
        _id: '2',
        name: 'Standard Cab',
        pricePerMinute: 3.0,
        isActive: true,
        currentBookings: []
      },
      {
        _id: '3',
        name: 'Premium Cab',
        pricePerMinute: 4.5,
        isActive: true,
        currentBookings: []
      },
      {
        _id: '4',
        name: 'Luxury Cab',
        pricePerMinute: 6.0,
        isActive: true,
        currentBookings: []
      },
      {
        _id: '5',
        name: 'SUV Cab',
        pricePerMinute: 5.5,
        isActive: true,
        currentBookings: []
      }
    ];

    // Default routes (bidirectional) - Updated to match reference diagram
    const routeData = [
      // A ↔ B: 5 min
      { from: 'A', to: 'B', timeInMinutes: 5 },
      { from: 'B', to: 'A', timeInMinutes: 5 },
      
      // A ↔ C: 7 min  
      { from: 'A', to: 'C', timeInMinutes: 7 },
      { from: 'C', to: 'A', timeInMinutes: 7 },
      
      // B ↔ C: 5 min
      { from: 'B', to: 'C', timeInMinutes: 5 },
      { from: 'C', to: 'B', timeInMinutes: 5 },
      
      // B ↔ D: 15 min
      { from: 'B', to: 'D', timeInMinutes: 15 },
      { from: 'D', to: 'B', timeInMinutes: 15 },
      
      // B ↔ E: 20 min
      { from: 'B', to: 'E', timeInMinutes: 20 },
      { from: 'E', to: 'B', timeInMinutes: 20 },
      
      // C ↔ E: 35 min
      { from: 'C', to: 'E', timeInMinutes: 35 },
      { from: 'E', to: 'C', timeInMinutes: 35 },
      
      // D ↔ E: 5 min
      { from: 'D', to: 'E', timeInMinutes: 5 },
      { from: 'E', to: 'D', timeInMinutes: 5 },
      
      // D ↔ F: 20 min
      { from: 'D', to: 'F', timeInMinutes: 20 },
      { from: 'F', to: 'D', timeInMinutes: 20 },
      
      // E ↔ F: 10 min
      { from: 'E', to: 'F', timeInMinutes: 10 },
      { from: 'F', to: 'E', timeInMinutes: 10 }
    ];

    this.routes = routeData.map((route, index) => ({
      _id: (index + 1).toString(),
      ...route,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    this.cabIdCounter = this.cabs.length + 1;
    this.routeIdCounter = this.routes.length + 1;
  }

  // Generic find methods
  find(collection, filter = {}) {
    const data = this[collection] || [];
    if (Object.keys(filter).length === 0) {
      return Promise.resolve(data);
    }
    
    const filtered = data.filter(item => {
      return Object.keys(filter).every(key => {
        if (key === '_id') {
          return item._id === filter[key];
        }
        return item[key] === filter[key];
      });
    });
    
    return Promise.resolve(filtered);
  }

  findOne(collection, filter) {
    return this.find(collection, filter).then(results => results[0] || null);
  }

  create(collection, data) {
    const newItem = {
      _id: this.getNextId(collection),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this[collection].push(newItem);
    return Promise.resolve(newItem);
  }

  update(collection, id, data) {
    const index = this[collection].findIndex(item => item._id === id);
    if (index === -1) {
      return Promise.resolve(null);
    }
    
    this[collection][index] = {
      ...this[collection][index],
      ...data,
      updatedAt: new Date()
    };
    
    return Promise.resolve(this[collection][index]);
  }

  delete(collection, id) {
    const index = this[collection].findIndex(item => item._id === id);
    if (index === -1) {
      return Promise.resolve(null);
    }
    
    const deleted = this[collection].splice(index, 1)[0];
    return Promise.resolve(deleted);
  }

  getNextId(collection) {
    if (collection === 'cabs') {
      return (this.cabIdCounter++).toString();
    } else if (collection === 'routes') {
      return (this.routeIdCounter++).toString();
    } else if (collection === 'bookings') {
      return (this.bookingIdCounter++).toString();
    }
    return Date.now().toString();
  }

  // Collection-specific methods
  deleteMany(collection, filter = {}) {
    if (Object.keys(filter).length === 0) {
      const deleted = [...this[collection]];
      this[collection] = [];
      return Promise.resolve({ deletedCount: deleted.length });
    }
    
    const toDelete = [];
    this[collection] = this[collection].filter(item => {
      const matches = Object.keys(filter).every(key => item[key] === filter[key]);
      if (matches) {
        toDelete.push(item);
        return false;
      }
      return true;
    });
    
    return Promise.resolve({ deletedCount: toDelete.length });
  }

  insertMany(collection, items) {
    const newItems = items.map(item => ({
      _id: this.getNextId(collection),
      ...item,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    this[collection].push(...newItems);
    return Promise.resolve(newItems);
  }
}

module.exports = new InMemoryDB();
