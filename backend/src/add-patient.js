import User from "./models/User.js";
import Hospital from "./models/Hospital.js";
import mongoose from "mongoose";

const addPatientUser = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/meditrack");
        console.log("Connected to MongoDB");

        // Check if patient user already exists
        const existingPatient = await User.findOne({ email: "patient@meditrack.com" });
        if (existingPatient) {
            console.log("Patient user already exists");
            mongoose.connection.close();
            return;
        }

        // Get the first hospital
        const hospital = await Hospital.findOne();
        if (!hospital) {
            console.log("No hospital found. Please create a hospital first.");
            mongoose.connection.close();
            return;
        }

        // Create patient user
        const patient = await User.create({
            name: "John Patient",
            email: "patient@meditrack.com",
            password: "patient123",
            role: "patient",
            hospitalId: hospital._id,
            permissions: ["tickets:read", "tickets:create"],
        });

        console.log("Patient user created successfully:");
        console.log(`- Name: ${patient.name}`);
        console.log(`- Email: ${patient.email}`);
        console.log(`- Role: ${patient.role}`);
        console.log(`- Hospital: ${hospital.name}`);

        mongoose.connection.close();
    } catch (error) {
        console.error("Error adding patient user:", error.message);
        mongoose.connection.close();
    }
};

addPatientUser();
