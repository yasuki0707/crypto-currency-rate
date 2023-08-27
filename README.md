## purpose of this project
keep track of latest cryptocurrency rate

## how to work
- create and setup LINE channel to push messages
- setup env variables for LINE channel you create
  - CHANNEL_SECRET
  - CHANNEL_ID:
- build container
- create a zip file
- upload generated zip to AWS Lambda
- configuration on AWS Lambda concole

## commands
### build docker image
docker build -t cryptocurrency-rate:latest .

### build container
docker run --rm -v "$PWD":/var/task cryptocurrency-rate:latest

### create a zip file
zip -r deploy_package.zip .

### upload generated zip to AWS Lambda
aws lambda update-function-code --function-name GetCryptoCurrenctyRate --zip-file fileb://deploy_package.zip
