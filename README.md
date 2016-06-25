# deploy-gh-pages
A command line utility for deploying to a gh-pages branch.

## Getting Started

Install the package:

```bash
npm install --save-dev --save-exact deploy-gh-pages
```

Add a script to your `package.json`:

```json
"scripts": {
  "deploy": "node_modules/.bin/deploy-gh-pages"
},
```

## Usage

To see all available options, use the CLI help command: 

`node_modules/.bin/deploy-gh-pages -h`

### Examples

The project pages for this repository are deployed as an example:

https://josh-egan.github.io/deploy-gh-pages/
