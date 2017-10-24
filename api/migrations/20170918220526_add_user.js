
exports.up = function(knex, Promise) {
  return knex.schema.createTable('user', t => {
    t.increments()
    t.string('email').unique()
    t.string('password')
    t.string('resetPasswordToken')
    t.string('resetPasswordExpires')
    t.string('facebook_profile_id')
    t.string('facebook_access_token')
    t.string('google_profile_id')
    t.string('google_access_token')
    t.string('avatar_url')
    t.string('username').notNullable()
    t.string('status_message').defaultTo('')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('user')
};
