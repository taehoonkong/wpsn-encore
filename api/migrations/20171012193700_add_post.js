
exports.up = function(knex, Promise) {
  return knex.schema.createTable('post', t => {
    t.increments()
    t.integer('user_id').unsigned()
    t.foreign('user_id').references('user.id').onDelete('CASCADE')
    t.string('picture_small')
    t.string('picture_big')
    t.string('preview')
    t.string('article')
    t.string('track')
    t.string('album')
    t.string('artist')
    t.integer('geo_x')
    t.integer('geo_y')
    t.string('address')
    t.timestamp('date').defaultTo(knex.fn.now())
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('post')
};
