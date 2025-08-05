const os = require("os");

var config = {
  bcrypt: {
    saltRounds: 12,
  },
  // Use actual values instead of environment variables
  admin_pass: "admin123", // ADMIN_PASS
  client_pass: "client123", // CLIENT_PASS
  admin_email: "admin@example.com", // ADMIN_EMAIL
  providers: {
    LOCAL: "local",
    GOOGLE: "google",
    MICROSOFT: "microsoft",
  },
  secret_key: "your-super-secret-jwt-key-change-this-in-production", // SECRET_KEY
  remote: "https://the-value-store-backend-production.up.railway.app", // REMOTE_URL
  port: process.env.NODE_ENV === "production" ? "" : "8080",
  hostUI:
    process.env.NODE_ENV === "production"
      ? "https://your-frontend-domain.com" // FRONTEND_URL
      : "http://localhost",
  portUI: process.env.NODE_ENV === "production" ? "" : "3000",
  google: {
    clientId: "your-google-client-id", // GOOGLE_CLIENT_ID
    clientSecret: "your-google-client-secret", // GOOGLE_CLIENT_SECRET
  },
  microsoft: {
    clientId: "your-microsoft-client-id", // MICROSOFT_CLIENT_ID
    clientSecret: "your-microsoft-client-secret", // MICROSOFT_CLIENT_SECRET
  },
  uploadDir: os.tmpdir(),
  email: {
    from: "your-email@gmail.com", // EMAIL_FROM
    host: "smtp.gmail.com", // EMAIL_HOST
    port: 587, // EMAIL_PORT
    auth: {
      user: "your-email@gmail.com", // EMAIL_USER
      pass: "iemx fhlu kiet grpf", // EMAIL_PASS (Google App Password)
    },
    tls: {
      rejectUnauthorized: false,
    },
  },
};

config.host =
  process.env.NODE_ENV === "production" ? config.remote : "http://localhost";
config.apiUrl = `${config.host}${config.port ? `:${config.port}` : ``}/api`;
config.uiUrl = `${config.hostUI}${config.portUI ? `:${config.portUI}` : ``}`;

// Database URL for Supabase
// postgresql://postgres:Devilinside123@db.wlsusjkwpljzcteqkkcy.supabase.co:5432/postgres
// or for the pooler:
// postgresql://postgres.wlsusjkwpljzcteqkkcy:Devilinside123@aws-0-ap-south-1.pooler.supabase.com:6543/postgres

module.exports = config;
