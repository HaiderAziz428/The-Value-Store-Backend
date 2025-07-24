module.exports = {
  production: {
    use_env_variable:
      "postgresql://neondb_owner:npg_SAPULEa82diN@ep-lucky-tree-a1fw16lb.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // <<<<<<< YOU NEED THIS
      },
    },
  },
  development: {
    url: "postgresql://neondb_owner:npg_SAPULEa82diNQ@ep-lucky-tree-a1fw16lb.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    dialect: "postgres",
    logging: console.log,
  },
};
