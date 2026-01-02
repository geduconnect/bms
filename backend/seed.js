import bcrypt from "bcryptjs";
import pool from "./db.js";

const seedUsers = async() => {
    try {
        const password = await bcrypt.hash("password123", 10);

        const users = [{
                name: "Super Admin",
                email: "super@bms.com",
                role: "SUPER_ADMIN",
            },
            {
                name: "Admin",
                email: "admin@bms.com",
                role: "ADMIN",
            },
            {
                name: "Warehouse User",
                email: "warehouse@bms.com",
                role: "WAREHOUSE",
            },
            {
                name: "Dispatch User",
                email: "dispatch@bms.com",
                role: "DISPATCH",
            },
            {
                name: "IGC User",
                email: "igc@bms.com",
                role: "IGC",
            },
        ];

        // Clear existing users (optional)
        await pool.query("DELETE FROM users");

        for (const user of users) {
            await pool.query(
                `INSERT INTO users (name, email, password, role, status)
         VALUES (?, ?, ?, ?, 1)`, [user.name, user.email, password, user.role]
            );
        }

        console.log("✅ Users seeded successfully");
        process.exit();
    } catch (error) {
        console.error("❌ Error seeding users:", error);
        process.exit(1);
    }
};

seedUsers();