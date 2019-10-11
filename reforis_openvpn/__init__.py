#  Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
#
#  This is free software, licensed under the GNU General Public License v3.
#  See /LICENSE for more information.

from http import HTTPStatus
from pathlib import Path
from copy import deepcopy
from os.path import splitext

from flask import Blueprint, current_app, jsonify, request, make_response
from flask_babel import gettext as _

from .utils import OpenVPNAPIError, validate_json, log_error

BASE_DIR = Path(__file__).parent

# pylint: disable=invalid-name
blueprint = Blueprint('OpenVPN', __name__, url_prefix='/openvpn/api')

# pylint: disable=invalid-name
openvpn = {
    'blueprint': blueprint,
    'js_app_path': 'reforis_openvpn/js/app.min.js',
    'translations_path': BASE_DIR / 'translations',
}


# /authority

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


# /server-settings

@blueprint.route('/server-settings', methods=['GET'])
def get_server_settings():
    return jsonify(current_app.backend.perform('openvpn', 'get_settings'))


@blueprint.route('/server-settings', methods=['PATCH'])
def patch_server_settings():
    try:
        validate_json(request.json)
    except OpenVPNAPIError as error:
        return error.data, error.status_code

    response = current_app.backend.perform('openvpn', 'update_settings', request.json)
    if response.get('result') is not True:
        log_error(current_app, f'Invalid backend response for changing OpenVPN server settings: {response}', request)
        return jsonify(_('Cannot change OpenVPN server settings')), HTTPStatus.INTERNAL_SERVER_ERROR

    return jsonify(response)


# /clients

@blueprint.route('/clients', methods=['GET'])
def get_clients():
    return jsonify(current_app.backend.perform('openvpn', 'get_status')['clients'])


@blueprint.route('/clients', methods=['POST'])
def post_clients():
    try:
        validate_json(request.json, {'name': str})
    except OpenVPNAPIError as error:
        return error.data, error.status_code

    # Check for conflict (name)
    clients = current_app.backend.perform('openvpn', 'get_status')['clients']
    names = [client['name'] for client in clients]
    name = request.json['name']
    if name in names:
        return jsonify(_('Client \'{}\' is already registered').format(name)), HTTPStatus.CONFLICT

    response = current_app.backend.perform('openvpn', 'generate_client', request.json)
    if not response.get('task_id'):
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

    config = response.get('config')
    if not config:
        log_error(current_app, f'Invalid backend response on getting OpenVPN client configuration: {response}', request)
        return jsonify(_('Cannot get client')), HTTPStatus.INTERNAL_SERVER_ERROR

    return make_response((config, {'Content-Disposition': 'attachment; filename=turris.conf'}))


@blueprint.route('/clients/<client_id>', methods=['DELETE'])
def delete_client(client_id):
    response = current_app.backend.perform('openvpn', 'revoke', {'id': client_id})
    if response.get('result') is not True:
        log_error(current_app, f'Invalid backend response for revoking OpenVPN certificate: {response}', request)
        return jsonify(_('Cannot revoke certificate')), HTTPStatus.INTERNAL_SERVER_ERROR
    return '', HTTPStatus.NO_CONTENT


# /client-settings

@blueprint.route('/client-settings', methods=['GET'])
def get_client_settings():
    return jsonify(current_app.backend.perform('openvpn_client', 'list')['clients'])


@blueprint.route('/client-settings', methods=['POST'])
def post_client_settings():
    if 'settings' not in request.files:
        return jsonify(_('Missing data for \'settings\' file')), HTTPStatus.BAD_REQUEST
    settings_file = request.files['settings']

    # Check for conflict (name)
    settings = current_app.backend.perform('openvpn_client', 'list')['clients']
    name = splitext(settings_file.filename)[0]
    names = [setting['id'] for setting in settings]
    if name in names:
        return jsonify(_('Client settings \'{}\' already exist').format(name)), HTTPStatus.CONFLICT

    response = current_app.backend.perform(
        'openvpn_client',
        'add',
        {'id': name, 'config': settings_file.read().decode('utf-8')}
    )
    if response.get('result') is not True:
        log_error(current_app, f'Invalid backend response for adding OpenVPN client settings: {response}', request)
        return jsonify(_('Cannot add OpenVPN client settings')), HTTPStatus.INTERNAL_SERVER_ERROR

    return jsonify(response), HTTPStatus.CREATED


@blueprint.route('/client-settings/<settings_id>', methods=['PATCH'])
def patch_client_settings(settings_id):
    try:
        validate_json(request.json, {'enabled': bool})
    except OpenVPNAPIError as error:
        return error.data, error.status_code

    settings = deepcopy(request.json)
    settings['id'] = settings_id

    response = current_app.backend.perform('openvpn_client', 'set', settings)
    if response.get('result') is not True:
        log_error(current_app, f'Invalid backend response for changing OpenVPN client settings: {response}', request)
        return jsonify(_('Cannot change OpenVPN client settings')), HTTPStatus.INTERNAL_SERVER_ERROR

    return jsonify(response)


@blueprint.route('/client-settings/<settings_id>', methods=['DELETE'])
def delete_client_settings(settings_id):
    response = current_app.backend.perform('openvpn_client', 'del', {'id': settings_id})
    if response.get('result') is not True:
        log_error(current_app, f'Invalid backend response for deleting OpenVPN client settings: {response}', request)
        return jsonify(_('Cannot delete OpenVPN client settings')), HTTPStatus.INTERNAL_SERVER_ERROR
    return '', HTTPStatus.NO_CONTENT
