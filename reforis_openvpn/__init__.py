#  Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
#
#  This is free software, licensed under the GNU General Public License v3.
#  See /LICENSE for more information.

from http import HTTPStatus

from flask import Blueprint, current_app, jsonify, request, make_response
from flask_babel import gettext as _

from .utils import OpenVPNAPIError, validate_json, log_error

# pylint: disable=invalid-name
blueprint = Blueprint('OpenVPN', __name__, url_prefix='/openvpn/api')

# pylint: disable=invalid-name
openvpn = {
    'blueprint': blueprint,
    'js_app_path': 'openvpn/app.min.js'
}


@blueprint.route('/authority', methods=['GET'])
def get_authority():
    response = current_app.backend.perform('openvpn', 'get_status')
    return jsonify({'status': response['status']})


@blueprint.route('/authority', methods=['POST'])
def post_authority():
    ca_status = current_app.backend.perform('openvpn', 'get_status').get('status')
    if ca_status == 'ready':
        return jsonify(_('Certificate authority already exists')), HTTPStatus.BAD_REQUEST
    return jsonify(current_app.backend.perform('openvpn', 'generate_ca')), HTTPStatus.ACCEPTED


@blueprint.route('/authority', methods=['DELETE'])
def delete_authority():
    response = current_app.backend.perform('openvpn', 'delete_ca')
    if response.get('result') is not True:
        log_error(current_app, f'Invalid backend response for deleting OpenVPN CA: {response}', request)
        return jsonify(_('Cannot delete certificate authority')), HTTPStatus.INTERNAL_SERVER_ERROR
    return '', HTTPStatus.NO_CONTENT


@blueprint.route('/server-settings', methods=['GET'])
def get_server_settings():
    return jsonify(current_app.backend.perform('openvpn', 'get_settings'))


@blueprint.route('/server-settings', methods=['PATCH'])
def patch_server_settings():
    try:
        validate_json(request.json)
    except OpenVPNAPIError as error:
        return error.data, error.status_code
    return jsonify(current_app.backend.perform('openvpn', 'update_settings', request.json))


@blueprint.route('/clients', methods=['GET'])
def get_clients():
    return jsonify(current_app.backend.perform('openvpn', 'get_status')['clients'])


@blueprint.route('/clients', methods=['POST'])
def post_clients():
    try:
        validate_json(request.json, {'name': str})
    except OpenVPNAPIError as error:
        return error.data, error.status_code

    clients = current_app.backend.perform('openvpn', 'get_status')['clients']
    names = [client['name'] for client in clients]
    name = request.json['name']
    if name in names:
        return jsonify(_('Client \'{}\' is already registered').format(name)), HTTPStatus.CONFLICT

    response = current_app.backend.perform('openvpn', 'generate_client', request.json)
    if not response.get("task_id"):
        log_error(current_app, f'Invalid backend response for registering OpenVPN client: {response}', request)
        return jsonify(_('Cannot register client')), HTTPStatus.INTERNAL_SERVER_ERROR
    return jsonify(response), HTTPStatus.ACCEPTED


@blueprint.route('/clients/<client_id>', methods=['GET'])
def get_client(client_id):
    config_request = {'id': client_id}
    hostname = request.args.get('address')
    if hostname:
        config_request['hostname'] = hostname

    response = current_app.backend.perform('openvpn', 'get_client_config', config_request)
    if response.get('status') == 'not_found':
        return jsonify('Requested client does not exist'), HTTPStatus.NOT_FOUND

    config = response.get("config")
    if not config:
        log_error(current_app, f'Invalid backend response on getting OpenVPN client configuration: {response}', request)
        return jsonify(_('Cannot get client')), HTTPStatus.INTERNAL_SERVER_ERROR

    return make_response((config, {'Content-Disposition': 'attachment; filename="turris.conf"'}))


@blueprint.route('/clients/<client_id>', methods=['DELETE'])
def delete_client(client_id):
    response = current_app.backend.perform('openvpn', 'revoke', {'id': client_id})
    if response.get('result') is not True:
        log_error(current_app, f'Invalid backend response for revoking OpenVPN certificate: {response}', request)
        return jsonify(_('Cannot revoke certificate')), HTTPStatus.INTERNAL_SERVER_ERROR
    return '', HTTPStatus.NO_CONTENT
