const tripLeadService = require('../services/tripLead.service');

exports.createTripLead = async (req, res) => {
  try {
    const result = await tripLeadService.saveTripLead(req.body);
    res.status(201).json({ message: "Trip lead stored successfully", id: result.insertId });
  } catch (error) {
    console.error("Error saving trip lead:", error);
    res.status(500).json({ error: "Failed to store trip lead" });
  }
};

exports.getAllTripLeads = async (req, res) => {
  try {
    const tripLeads = await tripLeadService.getAllTripLeads();
    res.status(200).json(tripLeads);
  } catch (error) {
    console.error("Error fetching trip leads:", error);
    res.status(500).json({ error: "Failed to fetch trip leads" });
  }
};

exports.deleteTripLead = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await tripLeadService.deleteTripLead(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Trip lead not found" });
    }
    res.status(200).json({ message: "Trip lead deleted successfully" });
  } catch (error) {
    console.error("Error deleting trip lead:", error);
    res.status(500).json({ error: "Failed to delete trip lead" });
  }
};