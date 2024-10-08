const mongoose = require("mongoose");

const productsSchema = new mongoose.Schema(
  {
    product_id: { type: String, unique: true, trim: true, required: true },
    title: { type: String, trim: true, required: true },
    price: { type: String, trim: true, required: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    images: { type: Object, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    quantity: { type: Number, default: 0 },
    checked: { type: Boolean, default: false },
    sold: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const productsModel = mongoose.model("Products", productsSchema);
module.exports = productsModel;
