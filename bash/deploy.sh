#!/bin/bash
koyeb deploy . postmark-email-worker/worker \
  --type worker \
  --instance-type free \
  --regions fra \
  --env CLOUDAMQP_URL=$CLOUDAMQP_URL \
  --archive-builder docker \
  --archive-docker-dockerfile Dockerfile
