document.addEventListener('DOMContentLoaded', e => {

  socket = io()

  socket.emit('join', {id: 1}, data => {
    console.log(data.socket_id)
  })
  
  socket.on('reset_success', data => {
    console.log('reset_complete')
  })

  socket.on('browser connected', data => {
    console.log(`${data.socket_id} 접속하셨습니다.`)
  })
})
