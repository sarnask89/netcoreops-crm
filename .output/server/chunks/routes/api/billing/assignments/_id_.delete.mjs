import { d as defineEventHandler, k as getRouterParam, c as createError, l as db, ao as subscriptions } from '../../../../nitro/nitro.mjs';
import { eq } from 'drizzle-orm';

const _id__delete$1 = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Brak id subskrypcji" });
  const [subscription] = await db.delete(subscriptions).where(eq(subscriptions.id, id)).returning();
  if (!subscription) throw createError({ statusCode: 404, statusMessage: "Subskrypcja nie istnieje" });
  return { success: true, data: subscription };
});

const _id__delete$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__delete$1
}, Symbol.toStringTag, { value: 'Module' }));

const _id__delete = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__delete$1
}, Symbol.toStringTag, { value: 'Module' }));

export { _id__delete$2 as _, _id__delete as a };
