import { Notify } from 'quasar'

export default (type = '', msg) => {
  let notificationType = 'info'
  switch (type) {
    case 'error':
      notificationType = 'negative'
      break;
    case 'warn':
      notificationType = 'warning'
      break;
    case 'info':
      notificationType = 'info'
      break;
    default:
      notificationType = 'positive'
      break;
  }

  Notify.create({
    group: false,
    position: 'top',
    type: notificationType,
    message: msg
  })
}