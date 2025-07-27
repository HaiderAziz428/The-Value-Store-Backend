const express = require("express");
const cors = require("cors");
const app = express();
const passport = require("passport");
const cron = require("node-cron");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const db = require("./db/models");
const Stripe = require("stripe");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const authRoutes = require("./routes/auth");
const fileRoutes = require("./routes/file");
const productsRoutes = require("./routes/products");
const categoriesRoutes = require("./routes/categories");
const feedbackRoutes = require("./routes/feedback");
const ordersRoutes = require("./routes/orders");
const paymentsRoutes = require("./routes/payments");
const usersRoutes = require("./routes/users");

// Enable compression for all responses
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// CORS with specific options for better performance
app.use(
  cors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for development
    crossOriginEmbedderPolicy: false,
  })
);

require("./auth/auth");

// Increase body parser limits for file uploads
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Add caching headers middleware
app.use((req, res, next) => {
  // Cache static assets for 1 year
  if (
    req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)
  ) {
    res.setHeader("Cache-Control", "public, max-age=31536000");
  }
  // Cache API responses for 5 minutes
  else if (req.url.startsWith("/api/") && req.method === "GET") {
    res.setHeader("Cache-Control", "public, max-age=300");
  }
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/file", fileRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use(
  "/api/orders",
  passport.authenticate("jwt", { session: false }),
  ordersRoutes
);
app.use(
  "/api/payments",
  passport.authenticate("jwt", { session: false }),
  paymentsRoutes
);
app.use(
  "/api/users",
  passport.authenticate("jwt", { session: false }),
  usersRoutes
);

// Optimize image serving with proper headers
app.get("/images/:entity/:id.:ext", (req, res) => {
  const filePath = `${__dirname}/images/${req.params.entity}/${req.params.id}.${req.params.ext}`;

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Image not found");
  }

  // Set proper headers for images
  res.setHeader("Cache-Control", "public, max-age=31536000");
  res.setHeader("Content-Type", `image/${req.params.ext}`);

  res.sendFile(filePath);
});

app.post("/payment/session-initiate", async (req, res) => {
  const { clientReferenceId, customerEmail, lineItem, successUrl, cancelUrl } =
    req.body;

  const stripe = Stripe(process.env.STRIPE_KEY);

  let session;

  try {
    session = await stripe.checkout.sessions.create({
      client_reference_id: clientReferenceId,
      customer_email: customerEmail,
      payment_method_types: ["card"],
      line_items: [lineItem],
      payment_intent_data: {
        description: `${lineItem.name} ${lineItem.description}`,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  } catch (error) {
    res.status(500).send({ error });
  }

  return res.status(200).send(session);
});

app.post("/payment/session-complete", async (req, res) => {
  const stripe = Stripe(process.env.STRIPE_KEY);

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      req.headers["stripe-signature"],
      process.env.STRIPE_SIGNATURE
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      // complete your customer's order
      // e.g. save the purchased product into your database
      // take the clientReferenceId to map your customer to a product
    } catch (error) {
      return res.status(404).send({ error, session });
    }
  }

  return res.status(200).send({ received: true });
});

const PORT = process.env.PORT || 8080;

// Optimize database connection
db.sequelize.sync().then(function () {
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });

  // Optimize cron job to run less frequently
  cron.schedule("0 0 */6 * * *", () => {
    // Run every 6 hours instead of every hour
    exec("yarn reset", (err) => {
      if (err) {
        console.error(err);
      }
    });
  });
});

module.exports = app;
