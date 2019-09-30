help: ## This help.
	echo "make build"

build: ## Build apps and docker container
	npm version patch
	yarn build
	cd web && yarn build
	cd ..
	docker build -t autokin-spectacles .

clean:
	rm -rf build
	rm -rf web/build

publish:
	docker tag autokin-spectacles ariesbe/autokin-spectacles:latest
	docker push ariesbe/autokin-spectacles:latest