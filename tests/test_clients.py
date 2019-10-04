from http import HTTPStatus

from utils import get_mocked_client


def test_get_clients(app):
    backend_response = {'clients': []}
    with get_mocked_client(app, backend_response) as client:
        response = client.get('/openvpn/api/clients')
    assert response.status_code == HTTPStatus.OK
    assert response.json == backend_response['clients']


def test_post_client(app):
    backend_response = {
        'openvpn': {
            'get_status': {
                'clients': []
            },
            'generate_client': {
                'task_id': 1234
            }
        }
    }
    with get_mocked_client(app, backend_response, mock_specific_calls=True) as client:
        response = client.post('/openvpn/api/clients', json={'name': 'Joe Sixpack'})
    assert response.status_code == HTTPStatus.ACCEPTED
    assert response.json == backend_response['openvpn']['generate_client']


def test_post_client_duplicate(app):
    backend_response = {'clients': [{'name': 'Joe Sixpack'}]}
    with get_mocked_client(app, backend_response) as client:
        response = client.post('/openvpn/api/clients', json={'name': 'Joe Sixpack'})
    assert response.status_code == HTTPStatus.CONFLICT
    assert response.json == 'Client \'Joe Sixpack\' is already registered'


def test_post_client_missing_field(app):
    with get_mocked_client(app, {}) as client:
        response = client.post('/openvpn/api/clients', json={'codename': 'Duchess'})
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == {'name': 'Missing data for required field.'}


def test_post_client_invalid_json(app):
    with get_mocked_client(app, {}) as client:
        response = client.post('/openvpn/api/clients')
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == 'Invalid JSON'


def test_post_client_invalid_data(app):
    with get_mocked_client(app, {}) as client:
        response = client.post('/openvpn/api/clients', json={'name': 1234})
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == {'name': 'Expected data of type: str'}


def test_post_client_backend_error(app):
    backend_response = {
        'openvpn': {
            'get_status': {
                'clients': []
            },
            'generate_client': {}
        }
    }
    with get_mocked_client(app, backend_response, mock_specific_calls=True) as client:
        response = client.post('/openvpn/api/clients', json={'name': 'Erika Mustermann'})
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot register client'


def test_get_client(app):
    backend_response = {'config': 'FOO=BAR'}
    with get_mocked_client(app, backend_response) as client:
        response = client.get('/openvpn/api/clients/1234')
    assert response.status_code == HTTPStatus.OK
    assert response.headers.get('Content-Disposition') == 'attachment; filename="turris.conf"'
    assert response.data == b'FOO=BAR'


def test_get_client_not_found(app):
    with get_mocked_client(app, {'status': 'not_found'}) as client:
        response = client.get('/openvpn/api/clients/1234')
    assert response.status_code == HTTPStatus.NOT_FOUND
    assert response.json == 'Requested client does not exist'


def test_get_client_backend_error(app):
    with get_mocked_client(app, {}) as client:
        response = client.get('/openvpn/api/clients/1234')
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot get client'


def test_delete_client(app):
    with get_mocked_client(app, {'result': True}) as client:
        response = client.delete('/openvpn/api/clients/1234')
    assert response.status_code == HTTPStatus.NO_CONTENT


def test_delete_client_backend_error(app):
    with get_mocked_client(app, {}) as client:
        response = client.delete('/openvpn/api/clients/1234')
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot revoke certificate'


def test_delete_client_unexpected_result(app):
    with get_mocked_client(app, {'result': 1234}) as client:
        response = client.delete('/openvpn/api/clients/1234')
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot revoke certificate'
