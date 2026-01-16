import { MedusaService } from "@medusajs/framework/utils";
import ProductVariantImagesModule from "./models/product-variant-images";

export default class ProductVariantImagesService extends MedusaService({
  ProductVariantImagesModule,
}) {
}