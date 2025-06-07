#!/bin/bash
koyeb deploy . \ 
  postmark-email-worker/worker \  # Creates (or re‑uses) the App postmark-email-worker and a Service called worker.
  --type worker \   # Marks the service as a long‑running background job (no ports exposed).
  --instance-type free \  # Pins it to the 512 MB free instance.
  --regions fra \  # Free tier only allows FRA or IAD.
  --env CLOUDAMQP_URL=$CLOUDAMQP_URL \  # Injects your RabbitMQ connection string.
  --archive-builder docker \
  --archive-docker-dockerfile Dockerfile  # Build with the Dockerfile you already have.
