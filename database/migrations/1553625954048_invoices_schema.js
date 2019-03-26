'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class InvoicesSchema extends Schema {
  up () {
    this.create('invoices', (table) => {
      table.increments()
      table.timestamps()
      table.string('donor')
      table.string('message')
      table.string('ln_invoice')
      table.string('socket_id')
      table.integer('satoshis')
      table.boolean('is_paid')
    })
  }

  down () {
    this.drop('invoices')
  }
}

module.exports = InvoicesSchema
