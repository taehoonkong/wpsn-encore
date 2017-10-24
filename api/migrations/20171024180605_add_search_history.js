
exports.up = function(knex, Promise) {
  return knex.schema.createTable('search_history', t => {
    t.increments()
    t.integer('user_id').unsigned()
    t.foreign('user_id').references('user.id').onDelete('CASCADE')
    t.string('keyword')
    t.string('type')
    t.timestamp('date').defaultTo(knex.fn.now())
  })  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('search_history')
};
