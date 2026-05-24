import { d as defineEventHandler, k as getRouterParam, c as createError, b4 as updateSubscriptionSchema, r as readBody, l as db, ao as subscriptions } from '../../../../nitro/nitro.mjs';
import { eq } from 'drizzle-orm';

function definedEntries(value) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== void 0));
}
const _id__patch$1 = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Brak id subskrypcji" });
  const payload = updateSubscriptionSchema.parse(await readBody(event));
  const updateData = {
    ...payload,
    priceOverrideNet: payload.priceOverrideNet === void 0 ? void 0 : payload.priceOverrideNet == null ? null : String(payload.priceOverrideNet),
    discountPercent: payload.discountPercent === void 0 ? void 0 : String(payload.discountPercent),
    activationFee: payload.activationFee === void 0 ? void 0 : String(payload.activationFee)
  };
  const [subscription] = await db.update(subscriptions).set(definedEntries(updateData)).where(eq(subscriptions.id, id)).returning();
  if (!subscription) throw createError({ statusCode: 404, statusMessage: "Subskrypcja nie istnieje" });
  return { success: true, data: subscription };
});

const _id__patch$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__patch$1
}, Symbol.toStringTag, { value: 'Module' }));

const _id__patch = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__patch$1
}, Symbol.toStringTag, { value: 'Module' }));

export { _id__patch$2 as _, _id__patch as a };
