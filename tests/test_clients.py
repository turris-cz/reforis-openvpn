#  Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
#
#  This is free software, licensed under the GNU General Public License v3.
#  See /LICENSE for more information.

from http import HTTPStatus

from reforis.test_utils import mock_backend_response


@mock_backend_response({'openvpn': {'get_status': {'clients': []}}})
def test_get_clients(client):
    response = client.get('/openvpn/api/clients')
    assert response.status_code == HTTPStatus.OK
    assert response.json == []


@mock_backend_response({
    'openvpn': {
        'get_status': {'clients': []},
        'generate_client': {'task_id': 1234}
    }
})
def test_post_client(client):
    response = client.post('/openvpn/api/clients', json={'name': 'Joe Sixpack'})
    assert response.status_code == HTTPStatus.ACCEPTED
    assert response.json == {'task_id': 1234}


@mock_backend_response({
    'openvpn': {
        'get_status': {'clients': [{'name': 'Joe Sixpack'}]},
    }
})
def test_post_client_duplicate(client):
    response = client.post('/openvpn/api/clients', json={'name': 'Joe Sixpack'})
    assert response.status_code == HTTPStatus.CONFLICT
    assert response.json == 'Client \'Joe Sixpack\' is already registered'


@mock_backend_response({'openvpn': {'get_status': {}}})
def test_post_client_missing_field(client):
    response = client.post('/openvpn/api/clients', json={'codename': 'Duchess'})
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == {'name': 'Missing data for required field.'}


@mock_backend_response({'openvpn': {'get_status': {}}})
def test_post_client_invalid_json(client):
    response = client.post('/openvpn/api/clients')
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == 'Invalid JSON'


@mock_backend_response({'openvpn': {'get_status': {}}})
def test_post_client_invalid_data(client):
    response = client.post('/openvpn/api/clients', json={'name': 1234})
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == {'name': 'Expected data of type: str'}


@mock_backend_response({
    'openvpn': {
        'get_status': {'clients': []},
        'generate_client': {}
    }
})
def test_post_client_backend_error(client):
    response = client.post('/openvpn/api/clients', json={'name': 'Erika Mustermann'})
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot register client'


@mock_backend_response({
    'openvpn': {'get_client_config': {'config': 'FOO=BAR', 'name' : 'turris'}}
})
def test_get_client(client):
    response = client.get('/openvpn/api/clients/1234')
    assert response.status_code == HTTPStatus.OK
    assert response.headers.get('Content-Disposition') == 'attachment; filename=turris.ovpn'
    assert response.data == b'FOO=BAR'


@mock_backend_response({
    'openvpn': {'get_client_config': {'status': 'not_found'}}
})
def test_get_client_not_found(client):
    response = client.get('/openvpn/api/clients/1234')
    assert response.status_code == HTTPStatus.NOT_FOUND
    assert response.json == 'Requested client does not exist'


@mock_backend_response({'openvpn': {'get_client_config': {}}})
def test_get_client_backend_error(client):
    response = client.get('/openvpn/api/clients/1234')
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot get client'


@mock_backend_response({'openvpn': {'revoke': {'result': True}}})
def test_delete_client(client):
    response = client.delete('/openvpn/api/clients/1234')
    assert response.status_code == HTTPStatus.NO_CONTENT


@mock_backend_response({'openvpn': {'revoke': {}}})
def test_delete_client_backend_error(client):
    response = client.delete('/openvpn/api/clients/1234')
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot revoke certificate'


@mock_backend_response({'openvpn': {'revoke': {'result': 1234}}})
def test_delete_client_unexpected_result(client):
    response = client.delete('/openvpn/api/clients/1234')
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot revoke certificate'
