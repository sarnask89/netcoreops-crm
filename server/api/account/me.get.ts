import { userInfo } from 'node:os'

export default defineEventHandler(async (event) => {
  const user = userInfo()
  const username = event.context.auth?.username || process.env.NETCOREOPS_OPERATOR_USERNAME || user.username || 'admin'
  const name = process.env.NETCOREOPS_OPERATOR_NAME || (username === 'root' ? 'Administrator' : username)
  const role = process.env.NETCOREOPS_OPERATOR_ROLE || 'Administrator lokalny'
  const email = process.env.NETCOREOPS_OPERATOR_EMAIL || `${username}@local.netcoreops`

  return {
    success: true,
    data: {
      username,
      name,
      role,
      email,
      host: process.env.HOSTNAME || 'localhost'
    }
  }
})
