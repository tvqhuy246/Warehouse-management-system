const express = require("express");
const router = express.Router();

const controller = require("../controllers/product.controller");
const requireAdmin = require("../middlewares/requireAdmin");
const { validateProduct } = require("../validators/product.schema");

router.get("/", controller.getAll);
router.post("/", requireAdmin, validateProduct, controller.create);
router.put("/:id", requireAdmin, validateProduct, controller.update);
router.delete("/:id", requireAdmin, controller.remove);

module.exports = router;
