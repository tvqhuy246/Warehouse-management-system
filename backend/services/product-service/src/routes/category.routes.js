const express = require("express");
const router = express.Router();
const controller = require("../controllers/category.controller");
const requireAdmin = require("../middlewares/requireAdmin");

// Public routes
router.get("/", controller.getAll);
router.get("/:id", controller.getById);

// Admin-only routes
router.post("/", requireAdmin, controller.create);
router.put("/:id", requireAdmin, controller.update);
router.delete("/:id", requireAdmin, controller.remove);

module.exports = router;
