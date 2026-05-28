import { apiHandler } from '../../../utils/api-handler'
import { readBody } from 'h3'
import { sendTestMail } from '../../../utils/mailer'
import { z } from 'zod'

export default apiHandler(async (event) => {
  const body = await readBody(event)
  const { id, to } = z.object({ id: z.number().int().positive(), to: z.string().email() }).parse(body)
  await sendTestMail(to, id)
  return { success: true, message: 'E-mail testowy wysłany' }
})
