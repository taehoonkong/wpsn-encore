const knex = require('./knex')
const bcrypt = require('bcrypt')
const validator = require('validator')

module.exports = {
  firstOrCreateUserByProvider({
    email,
    password=null,
    facebook_profile_id=null,
    facebook_access_token=null,
    google_profile_id=null,
    google_access_token=null,
    avatar_url=null,
    username
  }) {
    return knex('user')
      .where({email})
      .first()
      .then(user => {
        if(user) {
          if(user.password && user.facebook_access_token && user.google_access_token) {
            return user
          }
          else if(user.password) {
            if(!user.facebook_access_token && facebook_access_token) {
              return knex('user')
                .where({email})
                .update({
                  facebook_profile_id,
                  facebook_access_token,
                  avatar_url
                })
                .then((id) => {
                  return knex('user')
                    .where({id})
                    .first()
                })
            }
            else if(!user.google_access_token && google_access_token) {
              return knex('user')
                .where({email})
                .update({
                  google_profile_id,
                  google_access_token,
                  avatar_url
                })
                .then((id) => {
                  return knex('user')
                    .where({id})
                    .first()
                })
            }
            else {
              return user
            }
          }
          else if(user.facebook_access_token) {
            if(!user.password && password) {
              return knex('user')
                .where({email})
                .update({
                  password
                })
                .then((id) => {
                  return knex('user')
                    .where({id})
                    .first()
                })
            }
            else if(!user.google_access_token && google_access_token) {
              return knex('user')
                .where({email})
                .update({
                  google_profile_id,
                  google_access_token
                })
                .then((id) => {
                  return knex('user')
                    .where({id})
                    .first()
                })
            }
            else {
              return user
            }
          }
          else if (user.google_access_token) {
            if(!user.password && password) {
              return knex('user')
                .where({email})
                .update({
                  password
                })
                .then((id) => {
                  return knex('user')
                    .where({id})
                    .first()
                })
            }
            else if(!user.facebook_access_token && facebook_access_token) {
              return knex('user')
                .where({email})
                .update({
                  facebook_profile_id,
                  facebook_access_token
                })
                .then((id) => {
                  return knex('user')
                    .where({id})
                    .first()
                })
            }
            else {
              return user
            }
          }
        }
        else {
          return knex('user')
            .insert({
              email,
              password,
              facebook_profile_id,
              facebook_access_token,
              google_profile_id,
              google_access_token,
              avatar_url,
              username
            })
            .then(([id]) => {
              return knex('user')
                .where({id})
                .first()
            })
        }
      })
  },
  getUserByEmail({email}) {
    return knex('user')
      .where({email})
      .first()
  },
  getUserById(id) {
    return knex('user')
      .where({id})
      .first()
  },
  createPost({user_id, username, picture, preview, article, album, track, artist, geo_x, geo_y, address, like_count}) {
    return knex('post').insert({
      user_id, username, picture, preview, article, album, track, artist, geo_x, geo_y, address, like_count
    })
  },
  getWholePost() {
    return knex('post').where()
  },
  getPostById(id) {
    return knex('post').where({id}).first()
  },
  updatePostById(id, article) {
    return knex('post').where({id}).update(article)
  },
  detelePostById(id) {
    return knex('post').where({id}).delete()
  },
  getLikedByUserId(id) {
    return knex('like').where({id})
  }
  createLikeById({user_id, target_id}) {
    return knex('like').insert({
      user_id, target_id
    })
  }
  deleteLikeById({user_id, target_id}) {
    return knex('like').where({user_id, target_id}).delete()
  }

}

