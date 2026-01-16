import { model } from "@medusajs/framework/utils";

const ProductVariantImagesModule = model.define("product_variant_images", {
  id: model.id().primaryKey(),
  variant_id: model.text(),
  url: model.text(),
  metadata: model.json().nullable(),
  rank: model.number().default(0)
});

export default ProductVariantImagesModule;
