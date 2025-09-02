const db = require('../utils/inMemoryDB');

class Booking {
  static async find(filter = {}) {
    const bookings = await db.find('bookings', filter);
    return bookings.map(booking => new Booking(booking));
  }

  static async findById(id) {
    const booking = await db.findOne('bookings', { _id: id });
    return booking ? new Booking(booking) : null;
  }

  static async findOne(filter) {
    const booking = await db.findOne('bookings', filter);
    return booking ? new Booking(booking) : null;
  }

  static async findByIdAndUpdate(id, update, options = {}) {
    const updated = await db.update('bookings', id, update);
    return updated ? new Booking(updated) : null;
  }

  constructor(data) {
    Object.assign(this, data);
  }

  async save() {
    if (this._id) {
      const updated = await db.update('bookings', this._id, this);
      Object.assign(this, updated);
      return this;
    } else {
      const created = await db.create('bookings', this);
      Object.assign(this, created);
      return this;
    }
  }

  async populate(field, select) {
    if (field === 'cabId' && this.cabId) {
      const Cab = require('./CabSimple');
      const cab = await Cab.findById(this.cabId);
      if (cab && select) {
        const selectedFields = select.split(' ');
        const populatedCab = {};
        selectedFields.forEach(field => {
          if (cab[field] !== undefined) {
            populatedCab[field] = cab[field];
          }
        });
        this.cabId = populatedCab;
      } else {
        this.cabId = cab;
      }
    }
    return this;
  }
}

module.exports = Booking;
