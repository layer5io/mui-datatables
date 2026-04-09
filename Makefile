# .PHONY: Declares phony targets, which are commands that don't produce a file with the same name.
.PHONY: install start build test clean

# Install project dependencies
install:
	npm install

# Start the development server
start:
	npm run dev

# Build the project for production
build:
	npm run build

# Run project tests
test:
	npm run test

# Clean up build artifacts and installed modules
clean:
	rm -rf dist node_modules
