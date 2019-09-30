#  Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
#
#  This is free software, licensed under the GNU General Public License v3.
#  See /LICENSE for more information.

from http import HTTPStatus

from flask import Blueprint, current_app, jsonify, request
from flask_babel import gettext as _

from .utils import OpenVPNAPIError, validate_json

# pylint: disable=invalid-name
blueprint = Blueprint('OpenVPN', __name__, url_prefix='/openvpn/api')

# pylint: disable=invalid-name
openvpn = {
    'blueprint': blueprint,
    'js_app_path': 'openvpn/app.min.js'
}


@blueprint.route('/authority', methods=['GET'])
def get_certificate():
    return jsonify(current_app.backend.perform('openvpn', 'get_status'))


@blueprint.route('/authority', methods=['POST'])
def post_certificate():
    ca_status = current_app.backend.perform('openvpn', 'get_status').get('status')
    if ca_status == 'ready':
        return jsonify(_('Certificate authority already exists')), HTTPStatus.BAD_REQUEST
    return jsonify(current_app.backend.perform('openvpn', 'generate_ca')), HTTPStatus.ACCEPTED


@blueprint.route('/authority', methods=['DELETE'])
def delete_certificate():
    current_app.backend.perform('openvpn', 'delete_ca')
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
