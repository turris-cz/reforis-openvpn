# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.4.0] - 2025-11-04

### Added

- Added & updated Weblate translations

### Changed

- Updated several dependencies in package.json

## [2.3.0] - 2025-04-28

### Added

- Added & updated Weblate translations

### Changed

- Updated dependencies in package.json
- Fixed webpack configuration for process/browser.js
- Re-resolved and re-locked all npm dependencies in package-lock.json

## [2.2.0] - 2024-10-04

### Added

- Added & updated Weblate translations
- Added subnet validation to ServerSettingsForm component

### Changed

- Migrated to FontAwesome v6
- Updated Foris JS library to v6.4.0
- Refactored AddClientForm to handle error feedback
- Refactored ClientRegistration to visually separate AddClientForm and Clients

## [2.1.1] - 2024-06-26

### Added

- Added margin-bottom zero class to a Switch in ClientRow component

### Changed

- Updated CSS class names per Bootstrap 5
- Updated Foris JS library to v6.0.1

## [2.1.0] - 2024-06-25

### Changed

- Updated Foris JS library to v6.0.0
- Updated dependencies in package.json
- Updated .gitignore to exclude Ruff cache files
- NPM audit fix

## [2.0.0] - 2024-03-07

### Added

- Added & updated Weblate translations

### Changed

- Updated Makefile
- Updated dependencies in package.json
- Updated Node.js to v21.x in Makefile
- Updated ESLint and Prettier configurations
- Updated .gitignore to exclude minified JS files and license files
- Updated webpack.config.js with process/browser alias
- Updated CI to use shared scripts, build and publish python package
- Replaced Pylint & Pycodestyle for Ruff
- NPM audit fix

### Removed

- Removed MANIFEST.in

## [1.6.0] - 2022-12-06

- Add & update Weblate translations
- Add option to set client credentials
- Update Python image to v3.10.x
- Update Foris JS library to v5.5.0
- Fix server address validation
- Fix spelling and grammar mistakes
- Make DownloadButton unclickable when user's input is wrong
- Restructure & update Makefile
- Capitalize principal letters in headings
- Some other improvements
- NPM audit fix

## [1.5.0] - 2021-06-07

- Add & update translations
- Remove duplicated translations for Norwegian Bokmål
- Fix python dependencies
- Use name for OpenVPN settings from backend
- Update Foris JS library to version 5.1.12
- NPM audit fix

## [1.4.1] - 2020-11-03

- Download file with .ovpn extension instead of .conf

## [1.4.0] - 2020-10-09

- Add fluid layout support (redesign)
- Restructure headings
- Add cursor pointer on hover file input
- Integrate ESLint + Prettier + reForis styleguide
- Use ForisJS v5.1.5
- NPM audit fix

## [1.3.1] - 2020-04-22

- Show chosen filename in upload form
- Update translations
- NPM audit fix

## [1.3.0] - 2020-03-30

- Update ForisJS v4.5.0
- NPM update packages & audit fix
- Add foris-controller deps to Makefile

## [1.2.0] - 2020-02-17

- Use Foris JS 3.4.0
- Improve Makefile

## [1.1.3] - 2020-01-13

- Updated foris JS version
- Updated python dependencies and API tests
- Fixed memory leaks

## [1.1.1] - 2019-11-21

- Fix js app path
- npm audit fix

## [1.1.0] - 2019-11-20

- Added spinners to certificate authority generation and deletion
- Added missing translation message
- Updated version of foris js library (fixed global alert context problem)

## [1.0.0] - 2019-11-19

- Changed PATCH requests to PUT
- Fixed "Generate CA" button layout
- Improved handling of loading and errors
- Improved API errors
- Improved alerts
- Use shared eslint config, set standard for quotes in Python code
- Use improved API hooks

## [0.2.1] - 2019-10-22

- Init translations

## [0.2.0] - 2019-10-22

- Implement OpenVPN plugin
- Keep functionality of previous Foris OpenVPN plugin
- Add clients configuration

[unreleased]: https://gitlab.nic.cz/turris/reforis/reforis-openvpn/-/compare/v2.4.0...master
[2.4.0]: https://gitlab.nic.cz/turris/reforis/reforis-openvpn/-/compare/v2.3.0...v2.4.0
[2.3.0]: https://gitlab.nic.cz/turris/reforis/reforis-openvpn/-/compare/v2.2.0...v2.3.0
[2.2.0]: https://gitlab.nic.cz/turris/reforis/reforis-openvpn/-/compare/v2.1.1...v2.2.0
[2.1.1]: https://gitlab.nic.cz/turris/reforis/reforis-openvpn/-/compare/v2.1.0...v2.1.1
[2.1.0]: https://gitlab.nic.cz/turris/reforis/reforis-openvpn/-/compare/v2.0.0...v2.1.0
[2.0.0]: https://gitlab.nic.cz/turris/reforis/reforis-openvpn/-/compare/v1.6.0...v2.0.0
[1.6.0]: https://gitlab.nic.cz/turris/reforis/reforis-openvpn/-/compare/v1.5.0...v1.6.0
[1.5.0]: https://gitlab.nic.cz/turris/reforis/reforis-openvpn/-/compare/v1.4.1...v1.5.0
[1.4.1]: https://gitlab.nic.cz/turris/reforis/reforis-openvpn/-/compare/v1.4.0...v1.4.1
[1.4.0]: https://gitlab.nic.cz/turris/reforis/reforis-openvpn/-/compare/v1.3.1...v1.4.0
[1.3.1]: https://gitlab.nic.cz/turris/reforis/reforis-openvpn/-/compare/v1.3.0...v1.3.1
[1.3.0]: https://gitlab.nic.cz/turris/reforis/reforis-openvpn/-/compare/v1.2.0...v1.3.0
[1.2.0]: https://gitlab.nic.cz/turris/reforis/reforis-openvpn/-/compare/v1.1.3...v1.2.0
[1.1.3]: https://gitlab.nic.cz/turris/reforis/reforis-openvpn/-/compare/v1.1.1...v1.1.3
[1.1.1]: https://gitlab.nic.cz/turris/reforis/reforis-openvpn/-/compare/v1.1.0...v1.1.1
[1.1.0]: https://gitlab.nic.cz/turris/reforis/reforis-openvpn/-/compare/v1.0.0...v1.1.0
[1.0.0]: https://gitlab.nic.cz/turris/reforis/reforis-openvpn/-/compare/v0.2.1...v1.0.0
[0.2.1]: https://gitlab.nic.cz/turris/reforis/reforis-openvpn/-/compare/v0.2.0...v0.2.1
[0.2.0]: https://gitlab.nic.cz/turris/reforis/reforis-openvpn/-/tags/v0.2.0
