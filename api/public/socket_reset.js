document.addEventListener('DOMContentLoaded', e => {

  socket = io()

  socket.emit('join', {id: 1}, data => {
    console.log(data.socket_id)
  })

  socket.on('reset_success', data => {
  	window.close()
  })

  socket.on('browser connected', data => {
    console.log(`${data} 접속하셨습니다.`)
  })
})
