document.addEventListener('DOMContentLoaded', e => {
  // socket.io 연결 수립하고 room 설정, username 설정
  socket = io()

  socket.emit('join', {id: 1}, data => {
    console.log(data.socket_id)
  })

  // socket.on('reset_complete', data => {
  //   console.log(data.message)
  // })

  socket.on('reset_success', data => {
    const divListEl = document.querySelector('.alert')
    const message = data.message
    divListEl.removeChild(document.querySelector('#message'))
    const divEl = appendText(divListEl, message)
  })
  
  socket.on('close_auth', data => {
    const divListEl = document.querySelector('.alert')
    divListEl.removeChild(document.querySelector('#message'))
  })

  // (user connected) 새 사용자가 접속한 사실을 출력
  socket.on('browser connected', data => {
    console.log(`Browser ${data.socket_id} 접속했습니다.`)
  })
})

function appendText(divListEl, text) {
  const divEl = document.createElement('div')
  divEl.textContent = text
  divEl.setAttribute('id', 'message')
  divListEl.classList.remove('alert-info')
  divListEl.classList.add('alert-success')
  divListEl.insertBefore(divEl, divListEl.firstChild)
  return divEl
}
