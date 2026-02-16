require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../modules/auth/user.model");

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const email = "admin@resumeai.com";
        const password = "Admin123!";

        const existing = await User.findOne({ email });

        if (existing) {
            console.log("⚠️ Admin already exists");
            process.exit();
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await User.create({
            email,
            passwordHash: hashedPassword,
            role: "admin",
            plan: "custom"
        });


        console.log("✅ Admin created:");
        console.log("Email:", email);
        console.log("Password:", password);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAdmin();
