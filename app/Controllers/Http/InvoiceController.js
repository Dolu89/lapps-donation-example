'use strict'

const createInvoice = require('ln-service/createInvoice')
const LndService = use('App/Services/LndService')
const Invoice = use('App/Models/Invoice')

class InvoiceController {

    // Generate an invoice from LND and register it in database
    async generate({ response, request }) {
        try {
            const { donor, message, satoshis, socket_id } = request.all()

            if (satoshis == '' || !satoshis) {
                throw 'satoshis field is required'
            }
            if (socket_id == '' | !socket_id) {
                throw 'Something went wrong. Please retry in few minutes.'
            }

            const lnd = await LndService.getLndInstance();

            var invoiceExpirationTime = new Date()
            let expiresInMinutes = 10
            invoiceExpirationTime.setSeconds(invoiceExpirationTime.getSeconds() + (expiresInMinutes * 60));

            // Invoice creation using ln-service (see line "const createInvoice = require('ln-service/createInvoice')")
            const invoice = await createInvoice({
                lnd, // lnd instance is required
                tokens: satoshis, // tokens is the number of satoshis you ask for invoice
                description: `Donation of ${satoshis}sats (Donation example page)`,
                expires_at: invoiceExpirationTime, // expiration time in 
            })

            // Create a raw in database with a default value of is_paid to false.
            await Invoice.create({
                donor,
                message,
                ln_invoice: invoice.id,
                socket_id,
                satoshis,
                is_paid: false
            })

            // Return created invoice. You can use invoice.request to create QR Code in front app
            return response.send(invoice)

        } catch (error) {
            console.error(error)
            return response.send({ error: { message: error } })
        }
    }

}

module.exports = InvoiceController
