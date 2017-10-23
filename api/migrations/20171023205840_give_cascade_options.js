
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('comment', t => {
    t.integer('target_id').unsigned()
    t.foreign('target_id').references('post.id').onDelete('CASCADE').onUpdate('CASCADE')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('comment', t => {
    t.integer('target_id').unsigned()
    t.foreign('target_id').references('post.id')
  })
};
