export const ADMIN_EMAILS: string[] = (
  process.env.ADMIN_EMAILS ||
  'omar@girolab.net,admin@girolab.net,omarphc@hotmail.com,omarphc180726@gmail.com,luana@girolab.net,daniela@girolab.net'
)
  .split(',')
  .map(e => e.trim())
  .filter(Boolean)
