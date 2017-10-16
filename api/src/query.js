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
              return addInfoByProvider({email, facebook_profile_id, facebook_access_token, avatar_url, user})
            }
            else if(!user.google_access_token && google_access_token) {
              return addInfoByProvider({email, google_profile_id, google_access_token, avatar_url, user})
            }
            else {
              return user
            }
          }
          else if(user.facebook_access_token) {
            if(!user.password && password) {
              return addInfoByProvider({email, password, user})
            }
            else if(!user.google_access_token && google_access_token) {
              return addInfoByProvider({email, google_profile_id, google_access_token, user})
            }
            else {
              return user
            }
          }
          else if (user.google_access_token) {
            if(!user.password && password) {
              return addInfoByProvider({email, password, user})
            }
            else if(!user.facebook_access_token && facebook_access_token) {
              return addInfoByProvider({email, facebook_profile_id, facebook_access_token, user})
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
  resetEmailToken({email, resetPasswordToken, resetPasswordExpires}) {
    return knex('user')
      .where({email})
      .update({
        resetPasswordToken,
        resetPasswordExpires
      })
      .then(() => {
        return knex('user')
          .where({email})
          .first()
      })
  },
  resetEmailFindToken({resetPasswordToken}) {
    return knex('user')
      .where({resetPasswordToken})
      .andWhere('resetPasswordExpires', '>', Date.now())
      .first()
  },
  resetUserEmail({email, password}) {
    return knex('user')
      .where({email})
      .update({
        password,
        resetPasswordToken: null,
        resetPasswordExpires: null
      })
      .then(() => {
        return knex('user')
          .where({email})
          .first()
      })
  },
  createPost(user_id, username, picture_small, picture_big, preview, article, album, track, artist, geo_x, geo_y, address, like_count) {
    return knex('post').insert({
      user_id, username, picture_small, picture_big, preview, article, album, track, artist, geo_x, geo_y, address, like_count
    })
  },
  getWholePost() {
    return knex('post')
  },
  getFeedPost(user_id) {
    return knex('post').where({user_id})
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
  },
  createLikeById({user_id, target_id}) {
    return knex('like').insert({
      user_id, target_id
    })
  },
  deleteLikeById({user_id, target_id}) {
    return knex('like').where({user_id, target_id}).delete()
  },
  createCommentByPostId(user_id, username, target_id, comment) {
    return knex('comment').insert({
      user_id, username, target_id, comment
    })
  },
  deleteCommentById(id) {
    return knex('comment').where({id}).delete()
  },
  getCommentByPostId(target_id) {
    return knex('comment').where({target_id}).select('id', 'user_id', 'comment', 'date')
  }
}

function addInfoByProvider({ 
  email, 
  password=null, 
  facebook_profile_id=null, 
  facebook_access_token=null, 
  google_profile_id=null, 
  google_access_token=null, 
  avatar_url=null, 
  user 
}) {
  return knex('user')
    .where({email})
    .update({
      password : user.password ? user.password : password,
      facebook_profile_id : user.facebook_profile_id ? user.facebook_profile_id : facebook_profile_id,
      facebook_access_token : user.facebook_access_token ? user.facebook_access_token : facebook_access_token,
      google_profile_id : user.google_profile_id ? user.google_profile_id : google_profile_id,
      google_access_token : user.google_access_token ? user.google_access_token : google_access_token,
      avatar_url : user.avatar_url ? user.avatar_url : avatar_url,
    })
    .then(() => {
      return knex('user')
        .where({email})
        .first()
    })
}
