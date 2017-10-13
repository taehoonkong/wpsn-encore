
exports.up = function(knex, Promise) {
  return knex.schema.createTable('user', t => {
    t.increments()
    /*
    t.string('provider').notNullable()
    t.string('provider_user_id').notNullable()
    t.string('access_token'),
    t.string('avatar_url')
    t.string('username')
    */
    t.string('email')
    t.string('password')
    t.string('resetPasswordToken')
    t.string('resetPasswordExpires')
    t.string('facebook_profile_id')
    t.string('facebook_access_token')
    t.string('google_profile_id')
    t.string('google_access_token')
    t.string('avatar_url')
    t.string('username')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('user')
};
