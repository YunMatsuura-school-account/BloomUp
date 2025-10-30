require("dotenv").config(); // Load environment variables
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Import the vaccination model
const { VaccinationTemplate } = require("../models/vaccination");

async function seedBCVaccinationData() {
  try {
    console.log("🚀 Starting BC Vaccination Data Seeding...");

    // Connect to MongoDB using environment variables
    console.log("📡 Connecting to MongoDB...");
    console.log(`   Database: ${process.env.DB_NAME}`);

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB successfully!");

    // Read the BC vaccination schedule JSON file
    console.log("📖 Reading BC vaccination schedule data...");
    const dataPath = path.join(__dirname, "../data/bcVaccinationSchedule.json");
    const rawData = fs.readFileSync(dataPath, "utf8");
    const bcScheduleData = JSON.parse(rawData);

    console.log(
      `📊 Found ${bcScheduleData.vaccinations.length} vaccinations to import`
    );

    // Clear existing vaccination templates (optional - comment out if you want to keep existing data)
    console.log("🗑️  Clearing existing vaccination templates...");
    await VaccinationTemplate.deleteMany({});
    console.log("✅ Cleared existing data");

    // Prepare vaccination data for insertion
    const vaccinationsToInsert = bcScheduleData.vaccinations.map((vac) => ({
      name: vac.name,
      ageInMonths: vac.ageInMonths,
      description: vac.description,
      category: vac.category,
      isRequired: vac.isRequired,
      nextDoseAge: vac.nextDoseAge,
      totalDoses: vac.totalDoses,
      diseasesPrevented: vac.diseasesPrevented,
      sideEffects: vac.sideEffects,
      notes: vac.notes,
      province: bcScheduleData.province,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Insert all vaccinations
    console.log("💉 Inserting vaccination data into MongoDB...");
    const result = await VaccinationTemplate.insertMany(vaccinationsToInsert);
    console.log(`✅ Successfully inserted ${result.length} vaccinations!`);

    // Display summary
    console.log("\n📋 Summary:");
    console.log(`   Province: ${bcScheduleData.province}`);
    console.log(`   Total Vaccinations: ${result.length}`);
    console.log(`   Last Updated: ${bcScheduleData.lastUpdated}`);

    // Display vaccinations by age
    const byAge = result.reduce((acc, vac) => {
      const age = vac.ageInMonths;
      if (!acc[age]) acc[age] = [];
      acc[age].push(vac.name);
      return acc;
    }, {});

    console.log("\n🎯 Vaccinations by Age:");
    Object.keys(byAge)
      .sort((a, b) => Number(a) - Number(b))
      .forEach((age) => {
        const years = Math.floor(age / 12);
        const months = age % 12;
        const ageStr =
          years > 0
            ? `${years} year${years > 1 ? "s" : ""} ${
                months > 0 ? `${months} month${months > 1 ? "s" : ""}` : ""
              }`
            : `${months} month${months > 1 ? "s" : ""}`;
        console.log(
          `   ${ageStr.trim()} (${age} months): ${
            byAge[age].length
          } vaccination(s)`
        );
      });

    console.log("\n🎉 Seeding completed successfully!");
    console.log("\n📌 Next Steps:");
    console.log("   1. Verify data in MongoDB Compass");
    console.log(
      "   2. Test the API: GET /api/users/:userId/children/:childId/vaccinations/recommendations"
    );
    console.log("   3. Check the dashboard to see vaccination recommendations");
  } catch (error) {
    console.error("❌ Error seeding vaccination data:", error);
    console.error("Error details:", error.message);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log("\n👋 MongoDB connection closed");
    process.exit(0);
  }
}

// Run the seeding function
seedBCVaccinationData();
