
exports.up = function(knex, Promise) {
  return knex.schema.table('user', t => {
    t.string('status_message')
  })  
};

exports.down = function(knex, Promise) {
  return knex.schema.table('user', t => {
    t.dropColumn('status_message')
  })
};
