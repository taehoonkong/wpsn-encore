
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('post', t => {
    t.integer('like_count').defaultTo(0).alter()
 })   
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('post', t => {
    t.string('like_count')
  })
};
