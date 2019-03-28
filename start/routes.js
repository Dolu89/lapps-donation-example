'use strict';

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.0/routing
|
*/

const Route = use('Route');
const Next = use('Adonis/Addons/Next');
const handler = Next.getRequestHandler();

Route.post('/invoice', 'InvoiceController.generate')

// * Next Routes
Route.get(
  '*',
  ({ request, response }) =>
    new Promise((resolve, reject) => {
      handler(request.request, response.response, promise => {
        promise.then(resolve).catch(reject);
      });
    })
);
