import sequelize from "../config/db.js";
import seedDatabase from "../seedData.js";

async function seedProd() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connecté à la base de production");
    await seedDatabase({ force: true });
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  }
}

seedProd();
