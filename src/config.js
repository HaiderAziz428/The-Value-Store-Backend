const os = require("os");

var config = {
  bcrypt: {
    saltRounds: 12,
  },
  // Use environment variables for all secrets
  admin_pass: process.env.ADMIN_PASS, // ADMIN_PASS
  client_pass: process.env.CLIENT_PASS, // CLIENT_PASS
  admin_email: process.env.ADMIN_EMAIL, // ADMIN_EMAIL
  providers: {
    LOCAL: "local",
    GOOGLE: "google",
    MICROSOFT: "microsoft",
  },
  secret_key: process.env.SECRET_KEY, // SECRET_KEY
  remote: process.env.REMOTE_URL || "https://sing-generator-node.herokuapp.com", // REMOTE_URL (optional)
  port: process.env.NODE_ENV === "production" ? "" : "8080",
  hostUI:
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL || "https://flatlogic-ecommerce.herokuapp.com" // FRONTEND_URL (optional)
      : "http://localhost",
  portUI: process.env.NODE_ENV === "production" ? "" : "3000",
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID, // GOOGLE_CLIENT_ID
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // GOOGLE_CLIENT_SECRET
  },
  microsoft: {
    clientId: process.env.MICROSOFT_CLIENT_ID, // MICROSOFT_CLIENT_ID
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET, // MICROSOFT_CLIENT_SECRET
  },
  uploadDir: os.tmpdir(),
  email: {
    from: process.env.EMAIL_FROM || "support@flatlogic.com", // EMAIL_FROM (optional)
    host: process.env.EMAIL_HOST || "smtp.gmail.com", // EMAIL_HOST (optional)
    port: process.env.EMAIL_PORT || 587, // EMAIL_PORT (optional)
    auth: {
      user: process.env.EMAIL_USER || "support@flatlogic.com", // EMAIL_USER (optional)
      pass: process.env.EMAIL_PASS, // EMAIL_PASS (no fallback)
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

// To use Supabase, set DATABASE_URL in your environment to:
// postgresql://postgres:Devilinside123@db.wlsusjkwpljzcteqkkcy.supabase.co:5432/postgres
// or for the pooler:
// postgresql://postgres.wlsusjkwpljzcteqkkcy:Devilinside123@aws-0-ap-south-1.pooler.supabase.com:6543/postgres

module.exports = config;