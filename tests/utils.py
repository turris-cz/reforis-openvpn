from unittest import mock
from copy import deepcopy

from contextlib import contextmanager


def mock_perform_factory(backend_response):
    # Copy to avoid weird errors if original backend_response is modified
    response_copy = deepcopy(backend_response)
    def mock_perform(module, action, data=None):
        return response_copy[module][action]
    return mock_perform


@contextmanager
def get_mocked_client(app, backend_response, mock_specific_calls=False):
    backend_mock = mock.Mock()
    if mock_specific_calls:
        # Return arbitrary values for specified calls
        backend_mock.perform = mock.Mock(side_effect=mock_perform_factory(backend_response))
    else:
        # Mock perform regardless of passed arguments
        backend_mock.perform = mock.Mock(return_value=backend_response)
    patcher = mock.patch('reforis_openvpn.current_app.backend', backend_mock)

    with app.app_context():
        patcher.start()

    yield app.test_client()

    with app.app_context():
        patcher.stop()
