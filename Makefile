BACKEND_JS = $(shell find client/backend -name "*.js")
BACKEND_BUILT = $(patsubst client/backend/%.js, build/client/backend/%.js, $(BACKEND_JS))
COMMON_JS = $(shell find client/common -name "*.js")
COMMON_BUILT = $(patsubst client/common/%.js, build/client/common/%.js, $(COMMON_JS))
FRONTEND_JS = $(shell find client/frontend -name "*.js")
FRONTEND_BUILT = $(patsubst client/frontend/%.js, build/client/frontend/%.js, $(FRONTEND_JS))
SERVER_JS = $(shell find server -name "*.js")
SERVER_BUILT = $(patsubst server/%.js, build/server/%.js, $(SERVER_JS))
CSS = $(shell find public/style -name "*.css")

.PHONY: all
all: public/frontend.min.js public/backend.min.js public/mathleap.min.css $(SERVER_BUILT)

.PHONY: clean
clean:
	rm -rf build \
		client/backend/math.js \
		public/mathleap.min.css \
		public/frontend.js \
		public/frontend.min.js \
		public/backend.js \
		public/backend.min.js

public/frontend.min.js: public/frontend.js
	./node_modules/.bin/uglifyjs \
		--output $@ \
		--screw-ie8 \
		-- $<

public/backend.min.js: public/backend.js
	./node_modules/.bin/uglifyjs \
		--compress \
		--mangle \
		--output $@ \
		--screw-ie8 \
		-- $<

public/frontend.js: $(FRONTEND_BUILT) $(COMMON_BUILT)
	./node_modules/.bin/browserify build/client/frontend/main.js -o $@

public/backend.js: $(BACKEND_BUILT) $(COMMON_BUILT) build/client/backend/math.js
	./node_modules/.bin/browserify build/client/backend/main.js -o $@

build/client/%.js: client/%.js
	@mkdir -p "$(@D)"
	./node_modules/.bin/babel $< -o $@

build/server/%.js: server/%.js
	@mkdir -p "$(@D)"
	./node_modules/.bin/babel $< -o $@

client/backend/math.js: client/backend/math.json
	./node_modules/.bin/jison $< -o $@ -p lalr

public/mathleap.min.css: $(CSS)
	cat $^ | ./node_modules/.bin/cssmin > $@
