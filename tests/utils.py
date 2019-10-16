from reforis.test_utils import get_mocked_client

def get_mocked_openvpn_client(*args, **kwargs):
    return get_mocked_client('reforis_openvpn', *args, *kwargs)
