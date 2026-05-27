import { z } from 'zod'

const emptyToNull = (value: unknown) => value === '' ? null : value
const optionalText = z.preprocess(emptyToNull, z.string().trim().max(255).optional().nullable())

export const sevenDigitCodeSchema = z.string().regex(/^[0-9]{7}$/, 'Kod musi mieć dokładnie 7 cyfr')

export const addressReferenceSchema = z.object({
  terytCode: sevenDigitCodeSchema,
  simcCode: sevenDigitCodeSchema,
  ulicCode: z.string().regex(/^[0-9]{5,7}$/).nullable().optional(),
  buildingNumber: z.string().max(30).nullable().optional(),
  apartmentNumber: z.string().max(30).nullable().optional()
})

export const customerTypeSchema = z.enum(['INDIVIDUAL', 'BUSINESS'])

const customerApiBaseSchema = z.object({
  customerType: customerTypeSchema,
  fullName: z.string().max(255).nullable().optional(),
  firstName: optionalText,
  lastName: optionalText,
  pesel: z.preprocess(emptyToNull, z.string().regex(/^[0-9]{11}$/, 'PESEL musi mieć 11 cyfr').nullable().optional()),
  identityDocumentNumber: optionalText,
  companyName: optionalText,
  taxId: z.preprocess(emptyToNull, z.string().max(50).nullable().optional()),
  regon: z.preprocess(emptyToNull, z.string().regex(/^[0-9]{9,14}$/, 'REGON musi mieć 9 albo 14 cyfr').nullable().optional()),
  krs: z.preprocess(emptyToNull, z.string().max(20).nullable().optional()),
  representativeName: optionalText,
  contactEmail: z.preprocess(emptyToNull, z.string().email().nullable().optional()),
  contactPhone: z.preprocess(emptyToNull, z.string().max(50).nullable().optional()),
  billingAddressRef: addressReferenceSchema.nullable().optional(),
  billingAddress: z.preprocess(emptyToNull, z.string().nullable().optional())
})

export const createCustomerSchema = customerApiBaseSchema.superRefine((value, ctx) => {
  if (value.customerType === 'INDIVIDUAL' && (!value.firstName || !value.lastName)) {
    ctx.addIssue({
      code: 'custom',
      path: ['firstName'],
      message: 'Klient indywidualny wymaga imienia i nazwiska'
    })
  }

  if (value.customerType === 'BUSINESS' && !value.companyName) {
    ctx.addIssue({
      code: 'custom',
      path: ['companyName'],
      message: 'Firma wymaga nazwy'
    })
  }
})

export const updateCustomerSchema = customerApiBaseSchema.partial()

const optionalFormEmail = z.string().email().optional().or(z.literal(''))

export const customerFormSchema = z.object({
  customerType: customerTypeSchema,
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  pesel: z.string().optional(),
  identityDocumentNumber: z.string().optional(),
  companyName: z.string().optional(),
  taxId: z.string().optional(),
  regon: z.string().optional(),
  krs: z.string().optional(),
  representativeName: z.string().optional(),
  contactEmail: optionalFormEmail,
  contactPhone: z.string().optional(),
  billingBuildingNumber: z.string().optional(),
  billingApartmentNumber: z.string().optional(),
  billingAddress: z.string().optional()
}).superRefine((value, ctx) => {
  if (value.customerType === 'INDIVIDUAL') {
    if (!value.firstName) {
      ctx.addIssue({ code: 'custom', path: ['firstName'], message: 'Podaj imię' })
    }
    if (!value.lastName) {
      ctx.addIssue({ code: 'custom', path: ['lastName'], message: 'Podaj nazwisko' })
    }
  }
  if (value.customerType === 'BUSINESS' && !value.companyName) {
    ctx.addIssue({ code: 'custom', path: ['companyName'], message: 'Podaj nazwę firmy' })
  }
})

export type CustomerFormSchema = z.output<typeof customerFormSchema>
