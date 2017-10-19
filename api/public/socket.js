document.addEventListener('DOMContentLoaded', e => {
  // socket.io 연결 수립하고 room 설정, username 설정
  const formEl = document.querySelector('#reset-form')
  socket = io()

  socket.emit('join', {id: 1}, data => {
    console.log(data.socket_id)
  })

  socket.on('reset_success', data => {
  	window.close()
  	window.opener.close()
  })

  // formEl.addEventListener('submit', e => {
  //   const message = 'reset done'
  //   socket.emit('reset_now', {message}, data => {
  //     console.log(data.ok)
  //   })
  // })

  // (user connected) 새 사용자가 접속한 사실을 출력
  socket.on('browser connected', data => {
    console.log(`${data} 접속하셨습니다.`)
  })
})
