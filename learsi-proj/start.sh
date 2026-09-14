#!/bin/bash


trap "kill 0" EXIT

pushd room-ui
npm run build
popd


FLASK_DEBUG=1 python3 -m srcs.app
