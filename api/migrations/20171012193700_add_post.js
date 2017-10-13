
exports.up = function(knex, Promise) {
  return knex.schema.createTable('post', t => {
    t.increments()
    t.integer('user_id').unsigned()
    t.foreign('user_id').references('user.id')
    t.string('username')
    t.foreign('username').references('user.username')
    t.string('picture')
    t.string('preview')
    t.string('article')
    t.string('track')
    t.string('album')
    t.string('artist')
    t.string('geo_x')
    t.string('geo_y')
    t.string('address')
    t.string('like_count')
    t.timestamp('date').defaultTo(knex.fn.now())
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('post')
};
