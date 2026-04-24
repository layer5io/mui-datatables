# .PHONY: Declares phony targets, which are commands that don't produce a file with the same name.
.PHONY: install start build test clean

# Install project dependencies
setup:
	npm install

# Build site with development server
site:
	@echo "🏗️  Building site ..."
	npm install && npm run dev

# Build the project for production
build:
	npm run build

# Run project tests
test:
	npm run test

