koyeb service deploy github \
  --app postmark-email-worker \      # attach to the app you just created
  --name postmark-email-worker \              # service name shown in the console
  --git github.com/platocrat/mailmerge-studio \
  --branch main \              # or any branch/tag
  --dockerfile Dockerfile \    # path relative to repo root
  --type docker \              # builder = Docker
  --env CLOUDAMQP_URL=${CLOUDAMQP_URL} \
  --instance-type free \       # 512 MB RAM, 0.1 vCPU
  --regions fra                # free tier ⇢ FRA or IAD