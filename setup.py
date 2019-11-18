#  Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
#
#  This is free software, licensed under the GNU General Public License v3.
#  See /LICENSE for more information.

# !/usr/bin/env python3

import copy
import pathlib

import setuptools
from setuptools.command.build_py import build_py

NAME = 'reforis_openvpn'

BASE_DIR = pathlib.Path(__file__).absolute().parent


class CustomBuild(build_py):
    def run(self):
        # build package
        build_py.run(self)

        from reforis_distutils import ForisPluginBuild
        cmd = ForisPluginBuild(copy.copy(self.distribution))
        cmd.root_path = BASE_DIR
        cmd.module_name = NAME
        cmd.build_lib = self.build_lib
        cmd.ensure_finalized()
        cmd.run()


setuptools.setup(
    name=NAME,
    version='0.2.1',
    packages=setuptools.find_packages(exclude=['tests']),
    include_package_data=True,

    description='OpenVPN client and server plugin',
    author='CZ.NIC, z.s.p.o.',

    # All versions are fixed just for case. Once in while try to check for new versions.
    install_requires=[
        'flask',
        'Babel',
        'Flask-Babel',
    ],
    extras_require={
        'devel': [
            'pytest==3.7.1',
            'pylint==2.3.1',
            'pylint-quotes==0.2.1',
            'pycodestyle==2.5.0',
            'reforis @ git+https://gitlab.labs.nic.cz/turris/reforis/reforis@master#egg=reforis',
        ],
    },
    setup_requires=[
        'reforis_distutils',
    ],
    dependency_links=[
        "git+https://gitlab.labs.nic.cz/turris/reforis/reforis-distutils.git#egg=reforis-distutils",
    ],
    entry_points={
        'foris.plugins': f'{NAME} = {NAME}:openvpn'
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
    cmdclass={
        'build_py': CustomBuild,
    },
    zip_safe=False,
)
