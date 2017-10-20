
exports.up = function(knex, Promise) {
  return knex.schema.createTable('like', t => {
    t.increments()
    t.integer('user_id').unsigned().notNullable()
    t.foreign('user_id').references('user.id')
    t.integer('target_id').unsigned().notNullable()
    t.foreign('target_id').references('post.id')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('like')
};
