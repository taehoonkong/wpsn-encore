# WPSN SPA Security & Authentication

## SPA Security

SPA(Single-Page Application)은 사용자 경험이 좋은 만큼 프론트엔드와 백엔드의 코드가 복잡해지는 경우가 많습니다.

SPA와 API 서버의 출처가 같은 경우, 보안과 인증을 위해 전통적 방식대로 쿠키를 쓸 수 있습니다. 다만 쿠키를 위한 보안 정책(CSRF 등)은 당연히 적용해야 합니다.

SPA와 API 서버의 출처가 다른 경우에도 쿠키를 사용할 수 있지만, 여러가지 문제(구현 상 불편함, 보안의 취약함)때문에 보통 쿠키 대신 JWT와 같은 토큰을 사용하는 경우가 많습니다.
일단은 출처가 다르므로 CORS 보안 정책에 대한 구현이 필요한데,
이 때 설정을 통해서 특정 출처의 Ajax 요청에 대해서만 API 서버에 접근 가능하도록 [제한을 둘 수 있습니다.](https://www.npmjs.com/package/cors#configuring-cors)

```js
app.use(cors({
  origin: 'http://example.com',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}))
```

## SPA Authentication

SPA의 인증을 위해 단순하게 인증을 위한 REST API를 둘 수도 있을 것입니다. 하지만 **회원가입과 로그인은 누구나 할 수 있어야 한다는 특성**때문에 REST API가 공격을 받을 위험이 커지게 됩니다.

그래서 회원가입과 로그인 만큼은 SPA + REST API를 통해서 하는 것이 아니라, CSRF와 Captcha 등의 보안 정책을 적용한 별도의 웹 페이지를 통해 해주는 것이 좋습니다.
이런 전략을 사용하면 SPA와 웹 페이지 간에 토큰을 주고 받을 필요가 있는데,
이를 위해 팝업([window.open](https://developer.mozilla.org/en-US/docs/Web/API/Window/open))과 윈도우 간 메시지 통신([window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage))을 사용합니다.

아래의 두 프로젝트를 통해 직접 SPA 인증 절차를 시험해 볼 수 있습니다.

`api` 프로젝트는 passport를 이용해서 Github OAuth 로그인을 구현한 프로젝트입니다.

`spa` 프로젝트는 React를 이용해서 API 서버에 접속할 수 있는 프로젝트입니다.

인증 절차는 다음과 같이 구현되었습니다.

1. SPA에서 API 서버의 `/auth/` 경로에 대해 팝업을 열고 `message` 이벤트에 대한 핸들러를 등록합니다.
1. 사용자는 API 서버에 대해 열린 팝업에서 로그인을 시도합니다.
1. 로그인이 성공하면, 팝업에서 `window.opener.postMessage(...)`를 통해 SPA에 토큰을 전달합니다.
1. 이제부터 SPA에서 토큰을 통해 인증된 요청을 보낼 수 있게 됩니다.

인증 절차에 대한 자세한 사항은 코드를 참고해주세요.