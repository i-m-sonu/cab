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

    // Default routes (bidirectional)
    const routeData = [
      { from: 'A', to: 'B', timeInMinutes: 5 },
      { from: 'B', to: 'A', timeInMinutes: 5 },
      { from: 'A', to: 'C', timeInMinutes: 10 },
      { from: 'C', to: 'A', timeInMinutes: 10 },
      { from: 'B', to: 'C', timeInMinutes: 8 },
      { from: 'C', to: 'B', timeInMinutes: 8 },
      { from: 'C', to: 'D', timeInMinutes: 7 },
      { from: 'D', to: 'C', timeInMinutes: 7 },
      { from: 'D', to: 'E', timeInMinutes: 12 },
      { from: 'E', to: 'D', timeInMinutes: 12 },
      { from: 'D', to: 'F', timeInMinutes: 20 },
      { from: 'F', to: 'D', timeInMinutes: 20 },
      { from: 'E', to: 'F', timeInMinutes: 15 },
      { from: 'F', to: 'E', timeInMinutes: 15 },
      { from: 'B', to: 'D', timeInMinutes: 25 },
      { from: 'D', to: 'B', timeInMinutes: 25 },
      { from: 'A', to: 'E', timeInMinutes: 30 },
      { from: 'E', to: 'A', timeInMinutes: 30 }
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
