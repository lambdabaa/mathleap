### Getting started

Make sure you have `node` (version 4.2) and `make` installed locally.
Then, after fetching the repo from GitHub, do

```bash
cd mathleap
npm install
python -m SimpleHTTPServer 8080  # Any other web server is fine.
```

Navigating to [localhost:8080](http://localhost:8080) in a web
browser should open MathLeap. Currently, your local MathLeap will
use the production database, so be mindful :).

### Compiling MathLeap

`npm run prepublish` compiles your source changes. This happens
automatically after installing npm dependencies also since `npm
prepublish` is a dependency of `npm install`.

### Compiling as you go

When you're developing, you probably want the changes you make to source
files to be reflected in your local version of MathLeap. `npm run watch`
will listen to your filesystem, note when you make changes to source
files, and build them so that refreshing your browser will fetch the
latest stuff. Note that you'll need to install
[watchman](https://facebook.github.io/watchman/) first!

### Running the tests

```bash
npm test      # run the unit tests
npm run lint  # run the style checker
npm run flow  # run the type checker
```

Note that you currently need to be online in order for all of the unit
tests to pass since we speak to remote apis. In addition, the debug logs
are currently disabled by default while running tests. In order to turn them
on, set `DEBUG=1` (ie `DEBUG=1 npm test`).

### Question generation

There's an experimental question generation service in `gen/` that's
a rails app that runs on jruby. After you've installed

+ OpenJDK 8
+ [RVM](https://rvm.io/)
+ JRuby 1.7.24 (`rvm install jruby-1.7.24`)
+ Postgresql

you can do something like

```
> su - postgres  # switch to postgres user
> psql

# Within psql prompt
create role gen with createdb login password 'gen';

# After exiting psql from the mathleap/gen directory
> gem install bundler
> bundle install
> rake db:create
> rake db:migrate
> gem install foreman
> foreman start

# We should now be up and running on localhost:3000
```

Ping gareth on slack if you run into any issues.

### Submitting a patch

1. Fork the repo.
2. Create a branch with your changes.
3. Open a pull request.
4. Make sure your tests are passing on continuous integration by
   checking the CircleCI link in your pull request.
