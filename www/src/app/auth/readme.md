 else if (!environment.production && window.location.hostname === 'localhost') {
  // openid offline_access name given_name email preferred_username picture roles
  this.change.next({
    id_token: {
      exp: new Date(2030, 1, 1).getTime() / 1000,
      name: 'Jamie Vangeysel',
      given_name: 'Jamie',
      family_name: 'Vangeysel',
      email: 'vangeysel-jamie@hotmail.com',
      picture: 'https://www.gravatar.com/avatar/46ddb451c995eec3d51cd7e94bbcefe5?s=28&d=mp&r=pg',
      roles: [
        '*'
      ]
    },
    id_token_jwt: undefined,
    access_token: undefined,
    refresh_token: undefined
  })
}