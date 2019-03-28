import Head from '../components/head'

export default () => (
  <div>
    <Head title="Donation example page" />

    Buy me a coffee (or a lambo)
    <button>1000 sat</button>
    <button>10 000 sat</button>
    <button>100 000 sat</button>
    <input type="text" placeholder="Custom : 5 000 000" />
    <button>Send custom</button>
  </div>
)
