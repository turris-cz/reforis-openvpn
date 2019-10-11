from http import HTTPStatus
from io import BytesIO

from utils import get_mocked_client


def test_get_client_settings(app):
    backend_response = {'clients': []}
    with get_mocked_client(app, backend_response) as client:
        response = client.get('/openvpn/api/client-settings')
    assert response.status_code == HTTPStatus.OK
    assert response.json == backend_response['clients']


def test_post_client_settings(app):
    backend_response = {
        'openvpn_client': {
            'list': {'clients': []},
            'add': {'result': True}
        }
    }
    with get_mocked_client(app, backend_response, mock_specific_calls=True) as client:
        response = client.post(
            '/openvpn/api/client-settings',
            data={"settings": (BytesIO(b'foo=bar'), 'client.conf')},
            content_type='multipart/form-data'
        )
    assert response.status_code == HTTPStatus.CREATED
    assert response.json == backend_response['openvpn_client']['add']


def test_post_client_settings_backend_error(app):
    backend_response = {
        'openvpn_client': {
            'list': {'clients': []},
            'add': {}
        }
    }
    with get_mocked_client(app, backend_response, mock_specific_calls=True) as client:
        response = client.post(
            '/openvpn/api/client-settings',
            data={"settings": (BytesIO(b'foo=bar'), 'client.conf')},
            content_type='multipart/form-data'
        )
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot add OpenVPN client settings'


def test_post_client_settings_duplicate(app):
    existing_client = "jdoe"
    backend_response = {
        'openvpn_client': {
            'list': {'clients': [{'id': existing_client}]},
            'add': {}
        }
    }
    with get_mocked_client(app, backend_response, mock_specific_calls=True) as client:
        response = client.post(
            '/openvpn/api/client-settings',
            data={"settings": (BytesIO(b'foo=bar'), f'{existing_client}.conf')},
            content_type='multipart/form-data'
        )
    assert response.status_code == HTTPStatus.CONFLICT
    assert response.json == f'Client settings \'{existing_client}\' already exist'


def test_post_client_settings_missing_file(app):
    backend_response = {
        'openvpn_client': {
            'list': {'clients': []},
            'add': {'result': True}
        }
    }
    with get_mocked_client(app, backend_response, mock_specific_calls=True) as client:
        response = client.post(
            '/openvpn/api/client-settings',
            content_type='multipart/form-data'
        )
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == 'Missing data for \'settings\' file'


def test_patch_client_settings(app):
    backend_response = {'result': True}
    with get_mocked_client(app, backend_response) as client:
        response = client.patch('/openvpn/api/client-settings/A1A2B1B2', json={'enabled': True})
    assert response.status_code == HTTPStatus.OK
    assert response.json == backend_response


def test_patch_client_settings_backend_error(app):
    with get_mocked_client(app, {'result': False}) as client:
        response = client.patch('/openvpn/api/client-settings/A1A2B1B2', json={'enabled': True})
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot change OpenVPN client settings'


def test_patch_client_settings_invalid_json(app):
    with get_mocked_client(app, {}) as client:
        response = client.patch('/openvpn/api/client-settings/A1A2B1B2')
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == 'Invalid JSON'


def test_patch_client_settings_missing_data(app):
    with get_mocked_client(app, {}) as client:
        response = client.patch('/openvpn/api/client-settings/A1A2B1B2', json={'foo': 'bar'})
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == {'enabled': 'Missing data for required field.'}


def test_patch_client_settings_invalid_data(app):
    with get_mocked_client(app, {}) as client:
        response = client.patch('/openvpn/api/client-settings/A1A2B1B2', json={'enabled': 'bar'})
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == {'enabled': 'Expected data of type: bool'}


def test_delete_client_settings(app):
    with get_mocked_client(app, {'result': True}) as client:
        response = client.delete('/openvpn/api/client-settings/1234')
    assert response.status_code == HTTPStatus.NO_CONTENT


def test_delete_client_settings_backend_error(app):
    with get_mocked_client(app, {}) as client:
        response = client.delete('/openvpn/api/client-settings/1234')
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot delete OpenVPN client settings'


def test_delete_client_settings_unexpected_result(app):
    with get_mocked_client(app, {'result': 1234}) as client:
        response = client.delete('/openvpn/api/client-settings/1234')
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot delete OpenVPN client settings'
