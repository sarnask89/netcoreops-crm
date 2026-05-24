import { d as defineEventHandler, r as readBody, b5 as createSubscriptionSchema, l as db, ao as subscriptions } from '../../../nitro/nitro.mjs';

const index_post$1 = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const payload = createSubscriptionSchema.parse(body);
  const [subscription] = await db.insert(subscriptions).values({
    ...payload,
    priceOverrideNet: payload.priceOverrideNet == null ? null : String(payload.priceOverrideNet),
    discountPercent: String(payload.discountPercent),
    activationFee: String(payload.activationFee)
  }).returning();
  return { success: true, data: subscription };
});

const index_post$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: index_post$1
}, Symbol.toStringTag, { value: 'Module' }));

const index_post = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: index_post$1
}, Symbol.toStringTag, { value: 'Module' }));

export { index_post as a, index_post$2 as i };
