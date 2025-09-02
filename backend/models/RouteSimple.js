const db = require('../utils/inMemoryDB');

class Route {
  static async find(filter = {}) {
    return await db.find('routes', filter);
  }

  static async findById(id) {
    return await db.findOne('routes', { _id: id });
  }

  static async findByIdAndUpdate(id, update, options = {}) {
    return await db.update('routes', id, update);
  }

  static async findByIdAndDelete(id) {
    return await db.delete('routes', id);
  }

  static async deleteMany(filter = {}) {
    return await db.deleteMany('routes', filter);
  }

  static async insertMany(routes) {
    return await db.insertMany('routes', routes);
  }

  constructor(data) {
    Object.assign(this, data);
  }

  async save() {
    if (this._id) {
      const updated = await db.update('routes', this._id, this);
      Object.assign(this, updated);
      return this;
    } else {
      const created = await db.create('routes', this);
      Object.assign(this, created);
      return this;
    }
  }
}

module.exports = Route;
