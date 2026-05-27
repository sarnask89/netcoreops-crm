import { apiHandler } from '../utils/api-handler'
import { userInfo } from 'node:os'

export default apiHandler(async () => {
  const localUser = userInfo().username || 'admin'
  const name = process.env.NETCOREOPS_OPERATOR_NAME || localUser

  return [{
    name,
    username: process.env.NETCOREOPS_OPERATOR_USERNAME || localUser,
    role: 'owner',
    avatar: { alt: name }
  }]
})
