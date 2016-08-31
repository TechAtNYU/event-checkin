Event Check-in
====

Checks people into our events. Tech@NYU heavily relies on our [API](https://api.tnyu.org/v3), and we build a lot of our technologies on top of it. This particular one sees if a user is logged in, and then lets them check-in to an event.

For magnetic strip reading, [the card reader used in development can be found here](http://www.amazon.com/gp/product/B00D3D3L8Y?psc=1&redirect=true&ref_=oh_aui_detailpage_o04_s00), however, any card reader the emulates a HID keyboard device should work fine.

##Development
To run with production data (on port 3000):
```
git clone ...
npm install
npm start
```

To run with test data (on port 3000):
Same as above, but before starting the server, change `RestangularProvider.setBaseUrl('https://api.tnyu.org/v3');` in `app/js/app.js` to use the test url.