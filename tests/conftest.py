import pytest
from flask import Flask
from flask_babel import Babel

from reforis_openvpn import blueprint


@pytest.fixture(scope='module')
def app():
    app = Flask(__name__)
    app.register_blueprint(blueprint)
    app.backend = None
    Babel(app)
    return app
