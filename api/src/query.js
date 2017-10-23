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
  updateUserById({id, username, status_message}) {
    return knex('user')
      .where({id})
      .update({
        username,
        status_message
      })
      .then(() => {
        return knex('user')
          .select('id', 'email', 'username', 'avatar_url', 'status_message')
          .where({id})
          .first()
      })
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
  createPost({user_id, picture_small, picture_big, preview, article, album, track, artist, geo_x, geo_y, address, like_count}) {
    return knex('post').insert({
      user_id, picture_small, picture_big, preview, article, album, track, artist, geo_x, geo_y, address, like_count
    })
    .then(([id]) => {
      return knex('post')
        .where({id})
        .first()
    })
  },
  getWholePost() {
    return knex('post')
      .join('user', 'post.user_id', '=', 'user.id')
      .leftJoin('comment', 'post.id', '=', 'comment.target_id')
      .select('post.id', 'post.user_id','user.username', 'user.avatar_url',
        'post.picture_small', 'post.picture_big', 'post.preview', 'post.article', 'post.album',
        'post.track', 'post.artist', 'post.geo_x', 'post.geo_y', 'post.address',
        'post.like_count', 'post.date'
      )
      .count('comment.comment as comment_count')
      .groupBy('post.id')
      .orderBy('post.date', 'desc')
  },
  getPostByUserId(user_id) {
    return knex('post')
      .join('user', 'post.user_id', '=', 'user.id')
      .leftJoin('comment', 'post.id', '=', 'comment.target_id')
      .select('post.id', 'post.user_id','user.username', 'user.avatar_url',
        'post.picture_small', 'post.picture_big', 'post.preview', 'post.article', 'post.album',
        'post.track', 'post.artist', 'post.geo_x', 'post.geo_y', 'post.address',
        'post.like_count', 'post.date'
      )
      .count('comment.comment as comment_count')
      .where('post.user_id', user_id)
      .groupBy('post.id')
      .orderBy('post.date', 'desc')
  },
  getPostById(post_id) {
    return knex('post')
      .join('user', 'post.user_id', '=', 'user.id')
      .join('comment', 'post.id', '=', 'comment.target_id')
      .select('post.id', 'post.user_id','user.username', 'user.avatar_url',
        'post.picture_small', 'post.picture_big', 'post.preview', 'post.article', 'post.album',
        'post.track', 'post.artist', 'post.geo_x', 'post.geo_y', 'post.address',
        'post.like_count', 'post.date'
      )
      .count('comment.comment as comment_count')
      .where('post.id', post_id).first()
  },
  updatePostById(id, {article}) {
    return knex('post').where({id}).update({article})
  },
  detelePostById(id) {
    return knex('post').where({id}).delete()
  },
  getLikedByUserId(user_id) {
    return knex('like')
      .join('post', 'like.target_id', '=', 'post.id')
      .join('user', 'post.user_id', '=', 'user.id')
      .where('like.user_id', user_id)
      .select(
        'post.id AS post_id',
        'post.user_id AS post_user_id',
        'user.username',
        'user.avatar_url',
        'post.picture_small',
        'post.picture_big',
        'post.preview',
        'post.article',
        'post.album',
        'post.track',
        'post.artist',
        'post.geo_x',
        'post.geo_y',
        'post.address',
        'post.like_count',
        'post.date'
      )
      .orderBy('post.date', 'desc')
  },
  getLikedInfoByUserId(user_id) {
    return knex('like').where({user_id}).select('target_id').orderBy('id', 'desc')
  },
  getLikedState(user_id, target_id) {
    return knex('like').where({user_id, target_id}).select('target_id').first()
  },
  createLikeById({user_id, target_id}) {
    return knex('like').insert({
      user_id, target_id
    })
    .then(([id]) => {
      return knex('post')
        .where({id})
        .first()
    })
  },
  deleteLikeById(user_id, target_id) {
    return knex('like').where(user_id, target_id).delete()
  },
  createCommentByPostId({user_id, target_id, comment}) {
    return knex('comment').insert({
      user_id, target_id, comment
    })
    .then(([id]) => {
      return knex('comment')
        .where({id})
        .first()
    })
  },
  updateCommentById({id, comment}) {
    return knex('comment')
      .update({comment}).where({id})
      .then(() => {
        return knex('comment')
          .where({id})
          .first()
      })
  },
  deleteCommentById(id) {
    return knex('comment').where({id}).delete()
  },
  getCommentByPostId(target_id) {
    return knex('comment')
      .join('user', 'comment.user_id', '=', 'user.id')
      .select('comment.id', 'comment.user_id', 'user.username', 'user.avatar_url',
        'comment.comment', 'comment.date')
      .where({target_id})
      .orderBy('comment.date')
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
