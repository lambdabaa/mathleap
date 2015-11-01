COMMON_JS = $(shell find src/common -name "*.js")
COMMON_BUILT = $(patsubst src/common/%.js, build/common/%.js, $(COMMON_JS))
FRONTEND_JS = $(shell find src/frontend -name "*.js")
FRONTEND_BUILT = $(patsubst src/frontend/%.js, build/frontend/%.js, $(FRONTEND_JS))
BACKEND_JS = $(shell find src/backend -name "*.js")
BACKEND_BUILT = $(patsubst src/backend/%.js, build/backend/%.js, $(BACKEND_JS))

.PHONY: all
all: frontend.min.js backend.min.js

%.min.js: %.js
	./node_modules/.bin/uglifyjs $< -o $@

frontend.js: $(FRONTEND_BUILT) $(COMMON_BUILT)
	./node_modules/.bin/browserify build/frontend/main.js -o $@

backend.js: $(BACKEND_BUILT) $(COMMON_BUILT) build/backend/math.js
	./node_modules/.bin/browserify build/backend/main.js -o $@

build/%.js: src/%.js
	@mkdir -p "$(@D)"
	./node_modules/.bin/babel $< -o $@

src/backend/math.js: src/backend/math.json
	./node_modules/.bin/jison $< -o $@
