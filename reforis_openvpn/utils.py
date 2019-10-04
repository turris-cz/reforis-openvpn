from http import HTTPStatus

from flask import jsonify


class OpenVPNAPIError(Exception):
    def __init__(self, data, status_code):
        super().__init__(data)
        self.data = data
        self.status_code = status_code


def validate_json(json_data, expected_fields=None):
    """
    Raise OpenVPNAPIError when json_data is not valid.
    """
    if not json_data:
        raise OpenVPNAPIError(jsonify('Invalid JSON'), HTTPStatus.BAD_REQUEST)

    if not expected_fields:
        return

    errors = {}
    for field_name, field_type in expected_fields.items():
        field = json_data.get(field_name)
        if not field:
            errors[field_name] = 'Missing data for required field.'
        elif not isinstance(field, field_type):
            errors[field_name] = f'Expected data of type: {field_type.__name__}'
    if errors:
        raise OpenVPNAPIError(jsonify(errors), HTTPStatus.BAD_REQUEST)


def log_error(current_app, error, request):
    current_app.logger.error('%s; url: %s; data: %s', error, request.url, request.data)
