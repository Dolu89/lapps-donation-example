import React from 'react'
import Head from '../components/head'
import axios from 'axios'
import QrCode from 'qrcode'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

let ws = null

class Index extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      donor: '',
      message: '',
      socket_id: '',
      satoshis: 0,

      // Invoice 
      invoicePaid: false,
      invoiceQr: '',
      paymentRequest: '',

      // Websocket obj
      isConnected: false
    }

  }

  getInvoice = async (donor, message, satoshis, socket_id) => {
    debugger
    let result = await axios.post(`/invoice`, { donor, message, satoshis, socket_id })
    const invoice = result.data

    if (invoice.error) {
      //TODO toast error
    }
    else {
      const invoiceQr = await QrCode.toDataURL(invoice.request)
      this.setState({ invoiceQr, paymentRequest: invoice.request })
    }
  }

  handleChange = (event) => {
    const target = event.target, value = target.value, name = target.name;
    this.setState({ [name]: value });
  }

  render() {

    const { donor, message, satoshis, socket_id, invoiceQr, invoicePaid, paymentRequest } = this.state

    return (
      <div>
        <Head title="Donation example page" />

        Buy me a coffee (or a lambo)
        <div>
          Your name (optional) <input type="text" id="donor" name="donor" onChange={this.handleChange} value={donor} />
          Your message (optional) <input type="text" id="message" name="message" onChange={this.handleChange} value={message} />
        </div>

        {/* Display Button if no invoice is not generated yet */}
        {!invoiceQr &&
          <div>
            <button onClick={() => this.getInvoice(donor, message, 1000, socket_id)}>1000 sat</button>
            <button onClick={() => this.getInvoice(donor, message, 10000, socket_id)}>10 000 sat</button>
            <button onClick={() => this.getInvoice(donor, message, 100000, socket_id)}>100 000 sat</button>
            <input type="text" placeholder="Custom : 5 000 000" />
            <button>Send custom</button>
          </div>
        }

        {/* If an invoice is generated, display it */}
        {
          (invoiceQr && !invoicePaid) &&
          <div>
            <img src={invoiceQr}></img>
            <a href={`lightning:${paymentRequest}`} className="btn btn-primary">⚡ Open in wallet</a>
            <code>{paymentRequest}</code>
          </div>
        }

        {/* If the invoice is paid, display a message */}
        {invoicePaid && <span>Payment sent! Thank you soooooo much!</span>}

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnVisibilityChange
          draggable
          pauseOnHover
        />

      </div >

    )
  }

  componentDidMount() {
    import('@adonisjs/websocket-client').then(WS => {
      ws = WS.default()
      ws.connect()
      const donationSocket = ws.subscribe(`donation`)

      // Websocket custom events
      // Event when an invoice is paid (triggered only if YOU pay the invoice)
      donationSocket.on('donate-invoicepaid', (data) => {
        this.setState({ invoicePaid: true, donor: '', message: '' })
      })

      // Event when an invoice is paid (triggered only if YOU pay the invoice)
      donationSocket.on('donate-newdonation', (data) => {
        toast.success('₿ New donation!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      })

      // Websocket core events
      ws.on('open', (obj) => {
        this.setState({ isConnected: true, socket_id: obj.connId })
      })
      ws.on('close', () => {
        this.setState({ isConnected: false })
      })
    })
  }

  componentWillUnmount() {
    ws.close()
  }


}

export default Index;