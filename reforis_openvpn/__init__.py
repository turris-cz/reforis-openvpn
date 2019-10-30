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

from reforis.foris_controller_api.utils import APIError, validate_json


BASE_DIR = Path(__file__).parent

# pylint: disable=invalid-name
blueprint = Blueprint('OpenVPN', __name__, url_prefix='/openvpn/api')

# pylint: disable=invalid-name
openvpn = {
    'blueprint': blueprint,
    'js_app_path': 'reforis_openvpn/app.min.js',
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
        raise APIError(_('Certificate authority already exists'))
    return jsonify(current_app.backend.perform('openvpn', 'generate_ca')), HTTPStatus.ACCEPTED


@blueprint.route('/authority', methods=['DELETE'])
def delete_authority():
    response = current_app.backend.perform('openvpn', 'delete_ca')
    if response.get('result') is not True:
        raise APIError(_('Cannot delete certificate authority'), HTTPStatus.INTERNAL_SERVER_ERROR)
    return '', HTTPStatus.NO_CONTENT


# /server-settings

@blueprint.route('/server-settings', methods=['GET'])
def get_server_settings():
    return jsonify(current_app.backend.perform('openvpn', 'get_settings'))


@blueprint.route('/server-settings', methods=['PATCH'])
def patch_server_settings():
    validate_json(request.json)
    response = current_app.backend.perform('openvpn', 'update_settings', request.json)
    if response.get('result') is not True:
        raise APIError(_('Cannot change OpenVPN server settings'), HTTPStatus.INTERNAL_SERVER_ERROR)
    return jsonify(response)


# /clients

@blueprint.route('/clients', methods=['GET'])
def get_clients():
    return jsonify(current_app.backend.perform('openvpn', 'get_status')['clients'])


@blueprint.route('/clients', methods=['POST'])
def post_clients():
    validate_json(request.json, {'name': str})
    # Check for conflict (name)
    clients = current_app.backend.perform('openvpn', 'get_status')['clients']
    names = [client['name'] for client in clients]
    name = request.json['name']
    if name in names:
        raise APIError(_('Client \'{}\' is already registered').format(name), HTTPStatus.CONFLICT)

    response = current_app.backend.perform('openvpn', 'generate_client', request.json)
    if not response.get('task_id'):
        raise APIError(_('Cannot register client'), HTTPStatus.INTERNAL_SERVER_ERROR)
    return jsonify(response), HTTPStatus.ACCEPTED


@blueprint.route('/clients/<client_id>', methods=['GET'])
def get_client(client_id):
    config_request = {'id': client_id}
    hostname = request.args.get('address')
    if hostname:
        config_request['hostname'] = hostname

    response = current_app.backend.perform('openvpn', 'get_client_config', config_request)
    if response.get('status') == 'not_found':
        raise APIError(_('Requested client does not exist'), HTTPStatus.NOT_FOUND)

    config = response.get('config')
    if not config:
        raise APIError(_('Cannot get client'), HTTPStatus.INTERNAL_SERVER_ERROR)

    return make_response((config, {'Content-Disposition': 'attachment; filename=turris.conf'}))


@blueprint.route('/clients/<client_id>', methods=['DELETE'])
def delete_client(client_id):
    response = current_app.backend.perform('openvpn', 'revoke', {'id': client_id})
    if response.get('result') is not True:
        raise APIError(_('Cannot revoke certificate'), HTTPStatus.INTERNAL_SERVER_ERROR)
    return '', HTTPStatus.NO_CONTENT


# /client-settings

@blueprint.route('/client-settings', methods=['GET'])
def get_client_settings_list():
    return jsonify(current_app.backend.perform('openvpn_client', 'list')['clients'])


@blueprint.route('/client-settings/<settings_id>', methods=['GET'])
def get_client_settings(settings_id):
    settings = current_app.backend.perform('openvpn_client', 'list')['clients']
    search_result = next((s for s in settings if s['id'] == settings_id), None)
    if not search_result:
        raise APIError(_('Requested settings do not exist'), HTTPStatus.NOT_FOUND)
    return jsonify(search_result)


@blueprint.route('/client-settings', methods=['POST'])
def post_client_settings():
    if 'settings' not in request.files:
        raise APIError(_('Missing data for \'settings\' file'), HTTPStatus.BAD_REQUEST)
    settings_file = request.files['settings']

    # Check for conflict (name)
    settings = current_app.backend.perform('openvpn_client', 'list')['clients']
    name = splitext(settings_file.filename)[0]
    names = [setting['id'] for setting in settings]
    if name in names:
        raise APIError(_('Client settings \'{}\' already exist').format(name), HTTPStatus.CONFLICT)

    response = current_app.backend.perform(
        'openvpn_client',
        'add',
        {'id': name, 'config': settings_file.read().decode('utf-8')}
    )
    if response.get('result') is not True:
        raise APIError(_('Cannot add OpenVPN client settings'), HTTPStatus.INTERNAL_SERVER_ERROR)

    return jsonify(response), HTTPStatus.CREATED


@blueprint.route('/client-settings/<settings_id>', methods=['PATCH'])
def patch_client_settings(settings_id):
    validate_json(request.json, {'enabled': bool})

    settings = deepcopy(request.json)
    settings['id'] = settings_id

    response = current_app.backend.perform('openvpn_client', 'set', settings)
    if response.get('result') is not True:
        raise APIError(_('Cannot change OpenVPN client settings'), HTTPStatus.INTERNAL_SERVER_ERROR)

    return jsonify(response)


@blueprint.route('/client-settings/<settings_id>', methods=['DELETE'])
def delete_client_settings(settings_id):
    response = current_app.backend.perform('openvpn_client', 'del', {'id': settings_id})
    if response.get('result') is not True:
        raise APIError(_('Cannot delete OpenVPN client settings'), HTTPStatus.INTERNAL_SERVER_ERROR)
    return '', HTTPStatus.NO_CONTENT
