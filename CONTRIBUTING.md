[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

# Contributing to `trulioo-react`

Thanks for wanting to contribute to trulioo-react!

## Tests

`npm test`

Run tests from a specific folder i.e. `"src/tests/snapshot" and "src/tests/unit"`:

`npm test -- src/tests/snapshot src/tests/unit`

Run a certain test by title

`npm test src/tests/unit/TruliooForm.test.jsx -- -t "mapStateToProps"`

Integration tests (`src/tests/integration`) require EmbedID endpoints to be executed successfully.

To generate test coverage report:

`npm test -- --coverage`

Please add your tests under `src/tests/*` for the file(s) you are trying to update.

## Semantic Versioning (SemVer) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://semver.org/)

[Semantic Versioning](https://semver.org/) is utilized as means to versioning `trulioo-react`.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) as means of naming commit messages.

## Passing an Optional ApiKey in the headers (only for authenticated users)

You can pass in the Api Key which can exist in the headers. This request should only be used for authenticated users in secure environments only.