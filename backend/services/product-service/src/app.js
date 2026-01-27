const express = require("express");
const cors = require("cors");
const productRoutes = require("./routes/product.routes");
const globalErrorHandler = require("./utils/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/products", productRoutes);
app.use("/categories", require("./routes/category.routes"));
app.use("/locations", require("./routes/location.routes"));

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
