# Tailwind JIT CDN

Use the full power of Tailwind CSS' new JIT compiler by including one script tag to your HTML.

## Usage:

Just include this script tag into your site:

```
<script src="https://unpkg.com/tailwindcss-jit-cdn"></script>
```

You can learn all about this package in our [in-depth blog post](https://beyondco.de/blog/tailwind-jit-compiler-via-cdn).

## Support Us

[<img src="https://usewindy.com/img/card-new.png">](https://usewindy.com)

We spend a lot of time working on our [free developer services](https://beyondco.de/services) or open source packages. You can support our work by [buying one of our paid products](https://beyondco.de/software).

## Development

If you want to create your own build of TailwindCSS JIT CDN, you can fork this repo, clone it, and then run the following commands to get started:

```
yarn install
yarn run build
```

Then, link to your new `dist/tailwindcss-jit-cdn.umd.js` in your project in order to run your build.

## Options

A set of `tailwindOptions` to configure for the JIT CDN. Currently there is only one option available, you can use it as follows:

```
window.tailwindOptions = {
    observerElement: document.getElementById('app')
};
```

> By default the TailwindCSS JIT CDN will observe your entire page via `document.documentElement`, you can override this option via the `observerElement` property. In the options above the observer will only observe Tailwind classes inside of `app` element. This might be helpful for page speed, user experience, or a few other scenarios.

💡 Have ideas for options you would like to see, let us know.

## Credits

- [Marcel Pociot](https://github.com/mpociot)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
