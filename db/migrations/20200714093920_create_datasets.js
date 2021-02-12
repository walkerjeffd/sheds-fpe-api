const statusTypes = require('../types/status')

exports.up = knex => knex.schema.createTable('datasets', t => {
  t.increments('id').primary().unsigned()
  t.integer('station_id')
    .references('stations.id')
    .unsigned()
    .index()
    .notNullable()
    .onDelete('CASCADE')
  t.text('uuid')
  t.text('url')
  t.json('s3')
  t.json('config')
  t.enu('status', statusTypes, { useNative: true, enumName: 'status_type' })
  t.text('error_message')
  t.timestamps(true, true)
})

exports.down = knex => knex.schema.dropTable('datasets')
  .then(() => knex.raw('DROP TYPE status_type'))
