# Privacy-respecting conversion analytics setup

The site contains no advertising tracker and no hard-coded analytics account token. The shared analytics module in `assets/js/analytics.js` emits these events:

- `contact_form_submission`
- `package_builder_transfer`
- `email_click`
- `phone_click`
- `outbound_click`, with `destination` set to `wine_and_canvas` or `a_change_of_plans`

## Recommended Cloudflare setup

1. Add the production domain to Cloudflare and proxy the site through Cloudflare if it is not already proxied.
2. In the Cloudflare dashboard, enable **Web Analytics** for privacy-respecting page-view and Core Web Vitals reporting.
3. Enable **Zaraz** on the domain. The site automatically calls `zaraz.track()` when Zaraz is available; no code change is required.
4. In Zaraz, create triggers or goals matching each event name listed above.
5. Do not send form field values such as names, email addresses, phone numbers, event locations, or message text to analytics. The implementation sends only service selections, page/source labels, destination labels, and displayed package estimates.
6. Publish the Zaraz configuration and verify the events in Zaraz debug mode on the production domain.

If Cloudflare is not used, listen for the browser event `frank:conversion` and connect it to a privacy-respecting analytics provider. Keep the same restriction against sending personally identifiable form values.

## Verification

After deployment, test one action of each type while the browser network panel or Zaraz debug mode is open. Formspree submissions should be tested with a real test inquiry only after the destination inbox is confirmed.
