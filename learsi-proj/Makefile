.PHONY: build run all

all: run

build:
	cd room-ui && npm run build
	@echo "BUILD: [V]"

run:
	@trap "kill 0" EXIT; \
	cd room-ui && npm run dev & \
	echo "RUN: [V]" && \
	FLASK_DEBUG=1 python3 -m srcs.app

