
exports.up = function(knex, Promise) {
  return knex.schema.createTable('post', t => {
    t.increments()
    t.integer('user_id').unsigned()
    t.foreign('user_id').references('user.id')
    t.string('username')
    /* user 테이블이 수정되면 작동하도록 작성합니다.
    t.foreign('username').references('user.username')
    */
    t.string('picture')
    t.string('preview')
    t.string('article')
    t.timestamp('date').defaultTo(knex.fn.now())
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('post')
};
