from http import HTTPStatus

from utils import get_mocked_client


def test_get_server_settings(app):
    backend_response = {'key': 'value'}
    with get_mocked_client(app, backend_response) as client:
        response = client.get('/openvpn/api/server-settings')
    assert response.status_code == HTTPStatus.OK
    assert response.json == backend_response


def test_patch_server_settings(app):
    backend_response = {'result': True}
    with get_mocked_client(app, backend_response) as client:
        response = client.patch('/openvpn/api/server-settings', json={'foo': 'bar'})
    assert response.status_code == HTTPStatus.OK
    assert response.json == backend_response


def test_patch_server_settings_invalid_json(app):
    with get_mocked_client(app, {}) as client:
        response = client.patch('/openvpn/api/server-settings')
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == 'Invalid JSON'


def test_patch_server_settings_backend_error(app):
    with get_mocked_client(app, {'result': False}) as client:
        response = client.patch('/openvpn/api/server-settings', json={'foo': 'bar'})
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot change OpenVPN server settings'
