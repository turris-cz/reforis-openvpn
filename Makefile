#  Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
#
#  This is free software, licensed under the GNU General Public License v3.
#  See /LICENSE for more information.

.PHONY: all prepare-dev install install-js watch-js build-js lint lint-js lint-web test test-js test-web test-js-update-snapshots create-messages update-messages compile-messages clean

DEV_PYTHON=python3.7
ROUTER_PYTHON=python3.6
VENV_NAME?=venv
VENV_BIN=$(shell pwd)/$(VENV_NAME)/bin

JS_DIR=./js

all:
	@echo "make prepare-dev"
	@echo "    Create python virtual environment and install dependencies."
	@echo "make lint"
	@echo "    Run list on project."
	@echo "make install"
	@echo "    Install package in your system (for running on router)."
	@echo "make install-js"
	@echo "    Install dependencies"
	@echo "make build-js:"
	@echo "    Compile JS."
	@echo "make watch-js:"
	@echo "    Compile JS in watch mode."
	@echo "make create-messages"
	@echo "    Create locale messages (.pot)."
	@echo "make update-messages"
	@echo "    Update locale messages from .pot file."
	@echo "make compile-messages"
	@echo "    Compile locale messager."
	@echo "make clean"
	@echo "    Remove python artifacts and virtualenv."

venv: $(VENV_NAME)/bin/activate
$(VENV_NAME)/bin/activate: setup.py
	test -d $(VENV_NAME) || $(DEV_PYTHON) -m virtualenv -p $(DEV_PYTHON) $(VENV_NAME)
	# Some problem in latest version of setuptools during extracting translations.
	$(VENV_BIN)/$(DEV_PYTHON) -m pip install -U pip setuptools==39.1.0
	$(VENV_BIN)/$(DEV_PYTHON) -m pip install -e .[devel]
	touch $(VENV_NAME)/bin/activate

prepare-dev:
	which npm || curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
	which npm || sudo apt install -y nodejs
	cd $(JS_DIR); npm install

	which $(DEV_PYTHON) || sudo apt install -y $(DEV_PYTHON) $(DEV_PYTHON)-pip
	which virtualenv || sudo $(DEV_PYTHON) -m pip install virtualenv
	make venv

install:
	$(ROUTER_PYTHON) -m pip install -e .
	ln -sf /tmp/reforis_openvpn/reforis_static/openvpn /tmp/reforis/reforis_static/
install-js: js/package.json
	cd $(JS_DIR); npm install --save-dev

watch-js:
	cd $(JS_DIR); npm run-script watch
build-js:
	cd $(JS_DIR); npm run-script build

lint: lint-js lint-web
lint-js:
	cd $(JS_DIR); npm run lint
lint-js-fix:
	cd $(JS_DIR); npm run lint:fix
lint-web: venv
	$(VENV_BIN)/$(DEV_PYTHON) -m pylint --rcfile=pylintrc reforis_openvpn
	$(VENV_BIN)/$(DEV_PYTHON) -m pycodestyle --config=pycodestyle reforis_openvpn

test: test-js test-web
test-js:
	cd $(JS_DIR); npm test
test-web: venv
	$(VENV_BIN)/$(DEV_PYTHON) -m pytest -vv tests
test-js-update-snapshots:
	cd $(JS_DIR); npm test -- -u

create-messages:
	$(VENV_BIN)/pybabel extract -F babel.cfg -o ./reforis_openvpn/translations/messages.pot .
update-messages:
	$(VENV_BIN)/pybabel update -i ./reforis_openvpn/translations/messages.pot -d ./reforis_openvpn/translations
	$(VENV_BIN)/pybabel update -i ./reforis_openvpn/translations/tzinfo.pot -d ./reforis_openvpn/translations -D tzinfo
compile-messages:
	$(VENV_BIN)/pybabel compile -f -d ./reforis_openvpn/translations
	$(VENV_BIN)/pybabel compile -f -d ./reforis_openvpn/translations -D tzinfo

clean:
	find . -name '*.pyc' -exec rm -f {} +
	rm -rf $(VENV_NAME) *.eggs *.egg-info dist build .cache
	rm -rf dist build *.egg-info
	rm -rf $(JS_DIR)/node_modules/ reforis_static/openvpn/app.min.js
	$(ROUTER_PYTHON) -m pip uninstall -y reforis_openvpn
