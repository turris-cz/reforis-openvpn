#  Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
#
#  This is free software, licensed under the GNU General Public License v3.
#  See /LICENSE for more information.

from http import HTTPStatus
from io import BytesIO

from reforis.test_utils import mock_backend_response


@mock_backend_response({'openvpn_client': {'list': {'clients': []}}})
def test_get_client_settings_list(client):
    response = client.get('/openvpn/api/client-settings')
    assert response.status_code == HTTPStatus.OK
    assert response.json == []


@mock_backend_response({'openvpn_client': {'list': {'clients': [{'id': 'foobar'}]}}})
def test_get_client_settings(client):
    response = client.get('/openvpn/api/client-settings/foobar')
    assert response.status_code == HTTPStatus.OK
    assert response.json == {'id': 'foobar'}


@mock_backend_response({'openvpn_client': {'list': {'clients': [{'id': 'barfoo'}]}}})
def test_get_client_settings_not_found(client):
    response = client.get('/openvpn/api/client-settings/foobar')
    assert response.status_code == HTTPStatus.NOT_FOUND
    assert response.json == 'Requested settings do not exist'


@mock_backend_response({
    'openvpn_client': {
        'list': {'clients': []},
        'add': {'result': True},
    }
})
def test_post_client_settings(client):
    response = client.post(
        '/openvpn/api/client-settings',
        data={"settings": (BytesIO(b'foo=bar'), 'client.conf')},
        content_type='multipart/form-data'
    )
    assert response.status_code == HTTPStatus.CREATED
    assert response.json == {'result': True}


@mock_backend_response({
    'openvpn_client': {
        'list': {'clients': []},
        'add': {},
    }
})
def test_post_client_settings_backend_error(client):
    response = client.post(
        '/openvpn/api/client-settings',
        data={"settings": (BytesIO(b'foo=bar'), 'client.conf')},
        content_type='multipart/form-data'
    )
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot add OpenVPN client settings'


@mock_backend_response({
    'openvpn_client': {
        'list': {'clients': [{'id': 'jdoe'}]},
        'add': {}
    }
})
def test_post_client_settings_duplicate(client):
    response = client.post(
        '/openvpn/api/client-settings',
        data={"settings": (BytesIO(b'foo=bar'), f'jdoe.conf')},
        content_type='multipart/form-data'
    )
    assert response.status_code == HTTPStatus.CONFLICT
    assert response.json == f'Client settings \'jdoe\' already exist'


@mock_backend_response({
    'openvpn_client': {
        'list': {'clients': []},
        'add': {'result': True}
    }
})
def test_post_client_settings_missing_file(client):
    response = client.post(
        '/openvpn/api/client-settings',
        content_type='multipart/form-data'
    )
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == 'Missing data for \'settings\' file'


@mock_backend_response({'openvpn_client': {'set': {'result': True}}})
def test_put_client_settings(client):
    response = client.put('/openvpn/api/client-settings/A1A2B1B2', json={'enabled': True})
    assert response.status_code == HTTPStatus.OK
    assert response.json == {'result': True}


@mock_backend_response({'openvpn_client': {'set': {'result': False}}})
def test_put_client_settings_backend_error(client):
    response = client.put('/openvpn/api/client-settings/A1A2B1B2', json={'enabled': True})
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot change OpenVPN client settings'


@mock_backend_response({'openvpn_client': {'set': {}}})
def test_put_client_settings_invalid_json(client):
    response = client.put('/openvpn/api/client-settings/A1A2B1B2')
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == 'Invalid JSON'


@mock_backend_response({'openvpn_client': {'set': {}}})
def test_put_client_settings_missing_data(client):
    response = client.put('/openvpn/api/client-settings/A1A2B1B2', json={'foo': 'bar'})
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == {'enabled': 'Missing data for required field.'}


@mock_backend_response({'openvpn_client': {'set': {}}})
def test_put_client_settings_invalid_data(client):
    response = client.put('/openvpn/api/client-settings/A1A2B1B2', json={'enabled': 'bar'})
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == {'enabled': 'Expected data of type: bool'}


@mock_backend_response({'openvpn_client': {'del': {'result': True}}})
def test_delete_client_settings(client):
    response = client.delete('/openvpn/api/client-settings/1234')
    assert response.status_code == HTTPStatus.NO_CONTENT


@mock_backend_response({'openvpn_client': {'del': {}}})
def test_delete_client_settings_backend_error(client):
    response = client.delete('/openvpn/api/client-settings/1234')
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot delete OpenVPN client settings'


@mock_backend_response({'openvpn_client': {'del': {'result': False}}})
def test_delete_client_settings_unexpected_result(client):
    response = client.delete('/openvpn/api/client-settings/1234')
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot delete OpenVPN client settings'
