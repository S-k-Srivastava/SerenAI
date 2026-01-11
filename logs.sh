
#!/bin/bash

# Configuration
CONTAINER_NAME="serenai_backend"
LOG_DIR="./logs"
DATE=$(date +%Y-%m-%d)

echo "--------------------------------------------------------"
echo "  Backend Log Management Helper"
echo "--------------------------------------------------------"
echo "1. View live logs (tail -f)"
echo "2. Pull logs from container to local machine"
echo "--------------------------------------------------------"
read -p "Select an option (1 or 2): " option

case $option in
    1)
        echo "Tailing logs from $CONTAINER_NAME..."
        sudo docker logs -f $CONTAINER_NAME
        ;;
    2)
        echo "Pulling logs from $CONTAINER_NAME..."
        
        # Ensure local log directory exists
        mkdir -p $LOG_DIR/pulled
        
        # Copy logs directory from container
        # Note: Paths inside container depend on WORKDIR. Usually /app/logs if mapped or created.
        # Let's try to copy the entire logs directory.
        if sudo docker cp $CONTAINER_NAME:/app/logs $LOG_DIR/pulled/logs_$DATE; then
             echo "Logs successfully pulled to: $LOG_DIR/pulled/logs_$DATE"
             echo "Listing pulled files:"
             ls -R $LOG_DIR/pulled/logs_$DATE
        else
             echo "Failed to pull logs. Container path /app/logs might not exist or container is not running."
        fi
        ;;
    *)
        echo "Invalid option."
        ;;
esac
