import { d as defineEventHandler, l as db } from '../../../nitro/nitro.mjs';

const index_get$1 = defineEventHandler(async () => {
  const subscriptions = await db.query.subscriptions.findMany({
    with: {
      customer: true,
      customerDevice: true,
      tariff: true
    },
    orderBy: (table, { desc }) => [desc(table.createdAt)]
  });
  return { success: true, data: subscriptions };
});

const index_get$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: index_get$1
}, Symbol.toStringTag, { value: 'Module' }));

const index_get = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: index_get$1
}, Symbol.toStringTag, { value: 'Module' }));

export { index_get as a, index_get$2 as i };
