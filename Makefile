all: clean dev

dev:
	hugo serve .

build:
	hugo --minify --gc build

clean:
	rm -r generated/ || true
