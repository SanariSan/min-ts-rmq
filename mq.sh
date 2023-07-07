#!/bin/bash

docker run -it --rm \
--name rabbitmq \
--hostname 'rmq-persistent' \
-e 'RABBITMQ_DEFAULT_USER=guest' \
-e 'RABBITMQ_DEFAULT_PASS=guest' \
-v "test-rmq-data:/var/lib/rabbitmq/" \
-v "test-rmq-log:/var/log/rabbitmq" \
-p 5672:5672 -p 15672:15672 rabbitmq:3-management;