from http import HTTPStatus

from flask import jsonify


class OpenVPNAPIError(Exception):
    def __init__(self, data, status_code):
        super().__init__(data)
        self.data = data
        self.status_code = status_code


def validate_json(json_data):
    """
    Raise OpenVPNAPIError when json_data is not valid.
    """
    if not json_data:
        raise OpenVPNAPIError(jsonify('Invalid JSON'), HTTPStatus.BAD_REQUEST)
