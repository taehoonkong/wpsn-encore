
exports.up = function(knex, Promise) {
  return knex.schema.createTable('comment', t => {
    t.increments()
    t.integer('user_id').unsigned()
    t.foreign('user_id').references('user.id')
    t.integer('target_id').unsigned()
    t.foreign('target_id').references('post.id')
    t.string('comment').notNullable()
    t.timestamp('date').defaultTo(knex.fn.now())
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('comment')
};
