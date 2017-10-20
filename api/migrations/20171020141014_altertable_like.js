
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('like', t => {
    t.unique(['user_id', 'target_id'], 'ix_user_target')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('like', t => {
    t.dropUnique(['user_id', 'target_id'], 'ix_user_target')
  })
};
