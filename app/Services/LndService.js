'use strict'

const Env = use('Env')
const Ws = use('Ws')
const lnService = require('ln-service')
const Invoice = use('App/Models/Invoice')

let lndWebsocket = null
let lndInstance = null

class LndService {

    // Get an instance of your node
    async getLndInstance() {

        if (lndInstance == null) {

            const lndType = Env.get('LND_TYPE')

            if (lndType === 'btcpay') {
                // BTCPay version (BTCPay use his own cert)
                lndInstance = await lnService.lightningDaemon({
                    socket: this.getNodeAddress(),
                    macaroon: Env.get('LND_MACAROON'),
                });
            }
            else if(lndType === 'lnd') {
                // Standard LND node (Raspiblitz etc)
                lndInstance = await lnService.lightningDaemon({
                    cert: Env.get('LND_CERT'),
                    macaroon: Env.get('LND_MACAROON'),
                    socket: this.getNodeAddress()
                });
            }
            else{
                throw 'LND_TYPE is not configured. btcpay or lnd are allowed'
            }
        }

        return lndInstance
    }

    // Return host:port for ln-service connection
    getNodeAddress() {
        return `${Env.get('NODE_IP')}:${Env.get('NODE_PORT')}`
    }

    // This method return pubkey@host:port. It can be used to display a QR Code and open a channel with your node
    getNodeInformation() {
        return `${Env.get('LND_PUBKEY')}@${Env.get('NODE_IP')}:${Env.get('LND_PORT')}`
    }

    async initLndWS() {
        try {
            const lnd = await this.getLndInstance()
            lndWebsocket = lnService.subscribeToInvoices({ lnd })

            lndWebsocket.on('error', async err => {
                // recursive call
                try {
                    await this.initLndWS()
                } catch (err) {
                    console.log(err)
                }
            })

            lndWebsocket.on('data', async data => {
                if (data.is_confirmed) {
                    try {

                        // TODO Here is the place where you know an invoice is paid. Get it using data.id == ln_invoice (invoice table)
                        // Send an event with websocket to tell to everyone, an invoice was paid

                    } catch (error) {
                        console.log("data error", error)
                    }
                }
            })
        } catch (error) {
            console.log(error)
        }
    }

}

module.exports = new LndService()