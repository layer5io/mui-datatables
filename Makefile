# .PHONY: Declares phony targets, which are commands that don't produce a file with the same name.
.PHONY: install start build test clean

# Install project dependencies
site:
	npm install
	npm run dev

# Start the development server
site:
	npm run dev

# Build the project for production
build:
	npm run build

# Run project tests
test:
	npm run test

