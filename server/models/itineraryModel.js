class Itinerary {
  constructor({ id, name, email, phone, destination, travelers, children, childAges, duration, date, budget, hotelCategory, travelType, occupation, preferences, created_at }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.destination = destination;
    this.travelers = travelers;
    this.children = children;
    this.childAges = childAges; // array of ages
    this.duration = duration;
    this.date = date;
    this.budget = budget;
    this.hotelCategory = hotelCategory;
    this.travelType = travelType;
    this.occupation = occupation;
    this.preferences = preferences;
    this.created_at = created_at;
  }
}

module.exports = Itinerary;
