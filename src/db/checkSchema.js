const db = require("./models");

async function checkCategoriesSchema() {
  try {
    console.log("Checking categories table schema...");

    // Try to query with title column
    const categoriesWithTitle = await db.categories.findAll({
      attributes: ["id", "title", "description"],
      limit: 1,
    });
    console.log("✅ Categories table has 'title' column");
    console.log("Sample data:", categoriesWithTitle[0]?.get({ plain: true }));
  } catch (error) {
    console.log("❌ Error with 'title' column:", error.message);

    try {
      // Try to query with name column
      const categoriesWithName = await db.categories.findAll({
        attributes: ["id", "name", "description"],
        limit: 1,
      });
      console.log("✅ Categories table has 'name' column");
      console.log("Sample data:", categoriesWithName[0]?.get({ plain: true }));
    } catch (nameError) {
      console.log("❌ Error with 'name' column:", nameError.message);

      // Try to get all columns
      try {
        const allCategories = await db.categories.findAll({
          limit: 1,
        });
        console.log("✅ Categories table exists");
        console.log(
          "Available columns:",
          Object.keys(allCategories[0]?.get({ plain: true }) || {})
        );
      } catch (allError) {
        console.log("❌ Error accessing categories table:", allError.message);
      }
    }
  }
}

// Run the check
checkCategoriesSchema()
  .then(() => {
    console.log("Schema check completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Schema check failed:", error);
    process.exit(1);
  });
