#  Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
#
#  This is free software, licensed under the GNU General Public License v3.
#  See /LICENSE for more information.

# !/usr/bin/env python3

import setuptools

setuptools.setup(
    name='reforis_openvpn',
    version='0.0.1',
    packages=setuptools.find_packages(exclude=['tests']),
    include_package_data=True,

    description='',
    author='CZ.NIC, z.s.p.o.',

    # All versions are fixed just for case. Once in while try to check for new versions.
    install_requires=[
        'flask==1.0.2',
        'Babel==2.7.0',
        'Flask-Babel==0.12.2',
    ],
    extras_require={
        'devel': [
            'pytest==3.7.1',
            'pylint==2.3.1',
            'pycodestyle==2.5.0',
        ],
    },
    entry_points={
        'foris.plugins': 'openvpn = reforis_openvpn:openvpn'
    },
    classifiers=[
        'Framework :: Flask',
        'Intended Audience :: Developers',
        'Development Status :: 3 - Alpha',
        'License :: Other/Proprietary License',
        'Natural Language :: English',
        'Operating System :: OS Independent',
        'Programming Language :: Python :: 3',
        'Topic :: Internet :: WWW/HTTP :: WSGI :: Application',
    ],
    zip_safe=False,
)
