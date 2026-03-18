import mongoose from "mongoose";

const typeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isHidden: { type: Boolean, default: false }
});

const subCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
  types: [typeSchema]   // 🔥 ADD TYPES HERE
});

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    isHidden: { type: Boolean, default: false },
    subCategories: [subCategorySchema]
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);