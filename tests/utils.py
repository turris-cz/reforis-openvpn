from unittest import mock

from contextlib import contextmanager


@contextmanager
def get_mocked_client(app, backend_response):
    backend_mock = mock.Mock()
    backend_mock.perform = mock.Mock(return_value=backend_response)
    patcher = mock.patch("reforis_openvpn.current_app.backend", backend_mock)

    with app.app_context():
        patcher.start()

    yield app.test_client()

    with app.app_context():
        patcher.stop()
