#!make


help:
	@echo "Usage: make [build|start|start_dev|test|storybook|build_storybook|lint|format_code]"
	@echo ""
	@echo "Usage:"
	@echo "  make build  	        Builds the frontend for production and copies it to the dist folder"
	@echo "  make start  	        Starts the frontend in production mode"
	@echo "  make start_dev         Starts the frontend in development mode"
	@echo "  make test  	        Runs the frontend tests"
	@echo "  make coverage-test     Run tests on the project and generates a coverage report."
	@echo "  make storybook         Starts the storybook"
	@echo "  make build_storybook   Builds the storybook"
	@echo "  make lint  	        Runs the frontend linter"
	@echo "  make format_code       Formats the frontend code with biome and fix the code style"
	@echo ""

setup: package.json
	yarn install

build: setup
	yarn build

start: setup
	yarn start

start_dev: setup
	yarn start:dev

test: setup
	yarn test

coverage-test: setup
	yarn test -- --coverage

storybook: setup
	yarn storybook

build-storybook: setup
	yarn build-storybook

lint: setup
	yarn lint

all:
	test
