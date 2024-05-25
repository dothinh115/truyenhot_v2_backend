#!/bin/bash
log_file="./deploy.log"
log_time=$(date +"%Y-%m-%d %H:%M:%S")

YARN_PATH=/usr/local/bin/yarn
PM2_PATH=/root/.nvm/versions/node/v18.18.2/bin/pm2

export NVM_DIR="/root/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

NODE_VERSION=$(node -v)

if [ "$NODE_VERSION" != "v18.18.2" ]; then
nvm install 18.18.2
wait
nvm use 18.18.2
wait
fi

cd /var/www/truyenhot_BE
git reset --hard HEAD
wait
git fetch origin
wait

CHANGES=$(git log HEAD..origin/main --oneline)
wait
if [ -n "$CHANGES" ]; then
    git pull origin main
    $YARN_PATH install 
    wait
    $YARN_PATH add sharp --ignore-engines
    wait 
    $PM2_PATH stop nest
    wait
    $PM2_PATH delete nest
    wait
    $PM2_PATH start $YARN_PATH --name "nest" -i 2 -- start --port 4567
    wait
    log_content="Deploy thành công"
else
    log_content="Không có gì thay đổi"
fi

echo "$log_time: $log_content" >> "$log_file"