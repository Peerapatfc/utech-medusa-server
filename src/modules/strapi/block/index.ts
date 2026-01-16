import { Module } from "@medusajs/framework/utils"
import BlockService from "./service"

export const BLOCK_MODULE = "blockService"

export default Module(BLOCK_MODULE, {
  service: BlockService,
})