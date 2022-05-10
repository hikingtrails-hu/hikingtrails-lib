.PHONY: watch_test test docker lint lint-fix verify before-commit

default: dist

dist: node_modules src
	node_modules/.bin/tsc -p ./src --pretty

watch_test: node_modules
	node_modules/.bin/jest --watch

test: node_modules
	node_modules/.bin/jest --verbose --coverage

lint: node_modules
	node_modules/.bin/eslint .

lint-fix: node_modules
	node_modules/.bin/eslint . --fix

verify: lint test

node_modules: package.json yarn.lock
	yarn
	touch node_modules

before-commit: lint-fix verify
