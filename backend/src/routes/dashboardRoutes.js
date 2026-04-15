import express from "express";
import mongoose from "mongoose";

const router = express.Router();

const Hospital = mongoose.model("Hospital");
const User = mongoose.model("User");
const Ticket = mongoose.model("Ticket");

router.get("/stats", async (req, res) => {
  try {
    const [totalUsers, activeAdmins, totalTickets, totalHospitals, ticketsByType] = await Promise.all([
      User.countDocuments({ role: "patient" }),
      User.countDocuments({ role: "admin", isActive: true }),
      Ticket.countDocuments(),
      Hospital.countDocuments(),
      Ticket.aggregate([
        { $lookup: { from: "hospitals", localField: "hospitalId", foreignField: "_id", as: "hospital" } },
        { $unwind: { path: "$hospital", preserveNullAndEmptyArrays: true } },
        { $group: { _id: "$hospital.type", count: { $sum: 1 } } }
      ])
    ]);

    const statsByType = { gov: 0, private: 0, semi: 0 };
    ticketsByType.forEach(item => {
      if (item._id && statsByType.hasOwnProperty(item._id)) {
        statsByType[item._id] = item.count;
      }
    });

    res.json({
      totalUsers,
      activeAdmins,
      totalTickets,
      totalHospitals,
      statsByType
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats", error: error.message });
  }
});

export default router;
