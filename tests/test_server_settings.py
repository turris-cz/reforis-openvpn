from http import HTTPStatus

from reforis.test_utils import mock_backend_response


@mock_backend_response({'openvpn': {'get_settings': {'key': 'value'}}})
def test_get_server_settings(client):
    response = client.get('/openvpn/api/server-settings')
    assert response.status_code == HTTPStatus.OK
    assert response.json == {'key': 'value'}


@mock_backend_response({'openvpn': {'update_settings': {'result': True}}})
def test_put_server_settings(client):
    response = client.put('/openvpn/api/server-settings', json={'foo': 'bar'})
    assert response.status_code == HTTPStatus.OK
    assert response.json == {'result': True}


@mock_backend_response({'openvpn': {'update_settings': {}}})
def test_put_server_settings_invalid_json(client):
    response = client.put('/openvpn/api/server-settings')
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == 'Invalid JSON'


@mock_backend_response({'openvpn': {'update_settings': {'result': False}}})
def test_put_server_settings_backend_error(client):
    response = client.put('/openvpn/api/server-settings', json={'foo': 'bar'})
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot change OpenVPN server settings'
