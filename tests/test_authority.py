from http import HTTPStatus

from .utils import get_mocked_openvpn_client


def test_get_authority(app):
    backend_response = {'status': 'whatever'}
    with get_mocked_openvpn_client(app, backend_response) as client:
        response = client.get('/openvpn/api/authority')
    assert response.status_code == HTTPStatus.OK
    assert response.json == backend_response


def test_post_authority(app):
    backend_response = {'status': 'whatever'}
    with get_mocked_openvpn_client(app, backend_response) as client:
        response = client.post('/openvpn/api/authority')
    assert response.status_code == HTTPStatus.ACCEPTED
    assert response.json == backend_response


def test_post_authority_already_exists(app):
    with get_mocked_openvpn_client(app, {'status': 'ready'}) as client:
        response = client.post('/openvpn/api/authority')
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == 'Certificate authority already exists'


def test_delete_authority(app):
    with get_mocked_openvpn_client(app, {'result': True}) as client:
        response = client.delete('/openvpn/api/authority')
    assert response.status_code == HTTPStatus.NO_CONTENT
    assert response.data == b''


def test_delete_authority_error_no_result(app):
    with get_mocked_openvpn_client(app, {}) as client:
        response = client.delete('/openvpn/api/authority')
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot delete certificate authority'


def test_delete_authority_error_bad_result(app):
    with get_mocked_openvpn_client(app, {'result': 1234}) as client:
        response = client.delete('/openvpn/api/authority')
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot delete certificate authority'
