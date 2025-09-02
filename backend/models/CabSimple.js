const db = require('../utils/inMemoryDB');

class Cab {
  static async find(filter = {}) {
    const cabs = await db.find('cabs', filter);
    return cabs.map(cab => new Cab(cab));
  }

  static async findById(id) {
    const cab = await db.findOne('cabs', { _id: id });
    return cab ? new Cab(cab) : null;
  }

  static async findByIdAndUpdate(id, update, options = {}) {
    const updated = await db.update('cabs', id, update);
    return updated ? new Cab(updated) : null;
  }

  static async findByIdAndDelete(id) {
    return await db.delete('cabs', id);
  }

  constructor(data) {
    Object.assign(this, data);
  }

  async save() {
    if (this._id) {
      const updated = await db.update('cabs', this._id, this);
      Object.assign(this, updated);
      return this;
    } else {
      const created = await db.create('cabs', this);
      Object.assign(this, created);
      return this;
    }
  }

  isAvailable(startTime, endTime) {
    if (!this.currentBookings || this.currentBookings.length === 0) {
      return true;
    }

    return !this.currentBookings.some(booking => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      const requestStart = new Date(startTime);
      const requestEnd = new Date(endTime);
      
      // Check for overlap
      return (requestStart < bookingEnd && requestEnd > bookingStart);
    });
  }
}

module.exports = Cab;
