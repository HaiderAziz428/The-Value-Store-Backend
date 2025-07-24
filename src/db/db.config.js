module.exports = {
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // <<<<<<< YOU NEED THIS
      },
    },
  },
  development: {
    username: "postgres",
    dialect: "postgres",
    password: "Devilinside123", // <-- Enter your actual postgres password here
    database: "development", // <-- Use the database you created
    host: "localhost",
    logging: console.log,
  },
};
