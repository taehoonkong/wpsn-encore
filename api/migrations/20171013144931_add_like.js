
exports.up = function(knex, Promise) {
  return knex.schema.createTable('like', t => {
    t.increments()
    t.integer('user_id').unsigned().notNullable()
    t.foreign('user_id').references('user.id').onDelete('CASCADE')
    t.integer('target_id').unsigned().notNullable()
    t.foreign('target_id').references('post.id').onDelete('CASCADE')
    t.unique(['user_id', 'target_id'], 'ix_user_target')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('like')
};
