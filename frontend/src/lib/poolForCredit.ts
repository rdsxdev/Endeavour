import type { Credit } from "../api"
import { categoryOf } from "../stats"
import type { PoolKind } from "../pools"

export function poolForCredit(c: Credit): PoolKind {
  const cat = categoryOf(c.project)
  if (cat === "Blue Carbon" || cat === "Forest Conservation") return "bio"
  if (/bond|sovereign|treasury|gilt/i.test(c.project)) return "bond"
  return "carbon"
}
