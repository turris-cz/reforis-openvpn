#  Copyright (C) 2020 CZ.NIC z.s.p.o. (http://www.nic.cz/)
#
#  This is free software, licensed under the GNU General Public License v3.
#  See /LICENSE for more information.

from http import HTTPStatus

from reforis.test_utils import mock_backend_response


@mock_backend_response({'openvpn': {'get_status': {'status': 'whatever'}}})
def test_get_authority(client):
    response = client.get('/openvpn/api/authority')
    assert response.status_code == HTTPStatus.OK
    assert response.json == {'status': 'whatever'}


@mock_backend_response({'openvpn': {'generate_ca': {'status': 'whatever'}}})
def test_post_authority(client):
    response = client.post('/openvpn/api/authority')
    assert response.status_code == HTTPStatus.ACCEPTED
    assert response.json == {'status': 'whatever'}


@mock_backend_response({'openvpn': {
    'get_status': {'status': 'ready'},
}})
def test_post_authority_already_exists(client):
    response = client.post('/openvpn/api/authority')
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == 'Certificate authority already exists'


@mock_backend_response({'openvpn': {'delete_ca': {'result': True}}})
def test_delete_authority(client):
    response = client.delete('/openvpn/api/authority')
    assert response.status_code == HTTPStatus.NO_CONTENT
    assert response.data == b''


@mock_backend_response({'openvpn': {'delete_ca': {}}})
def test_delete_authority_error_no_result(client):
    response = client.delete('/openvpn/api/authority')
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot delete certificate authority'


@mock_backend_response({'openvpn': {'delete_ca': {'result': 1234}}})
def test_delete_authority_error_bad_result(client):
    response = client.delete('/openvpn/api/authority')
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot delete certificate authority'
