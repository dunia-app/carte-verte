#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Set NODE_ENV with a default if not already set
NODE_ENV=${NODE_ENV:-development}
echo "Using NODE_ENV: $NODE_ENV"

# Project ID and Region (replace with your values)
PROJECT_ID="carte-verte"
REGION="europe-west1"

# Root directory to start searching from
ROOT_DIR="$(pwd)"

get_scheduler_job_uris() {
    local project_id=$1
    local location=$2

    # Fetch all jobs and their URIs
    local jobs_output
    jobs_output=$(gcloud scheduler jobs list \
        --project="$project_id" \
        --location="$location" \
        --format="table(name,httpTarget.uri)" \
        2>&1)

    if [ $? -ne 0 ]; then
        echo "Error fetching jobs: $jobs_output" >&2
        return 1
    fi

    if [ -z "$jobs_output" ]; then
        echo "No jobs found or no permissions to list jobs." >&2
        return 0
    fi

    echo "$jobs_output" | tail -n +2 | awk '{print $2}' | sort | uniq
}

# Check if a URI already exists
check_uri_exists() {
    local uri="$1"
    local existing_uris="$2"
    
    echo $uri
    echo $existing_uris

    if [[ $existing_uris == *"$uri"* ]]; then
        echo 0
    else
        echo 1
    fi
}

# Function to create a Cloud Scheduler job if it doesn't exist
create_scheduler_job() {
    local job_name=$1
    local schedule=$2
    local url=$3

    if gcloud scheduler jobs describe "$job_name" --project="$PROJECT_ID" --location="$REGION" &>/dev/null; then
        echo "Job already exists: $job_name. Deleting and recreating."
        gcloud scheduler jobs delete "$job_name" --project="$PROJECT_ID" --location="$REGION" --quiet
    fi

    existing_uris=$(get_scheduler_job_uris "$PROJECT_ID" "$REGION")
    existing_uri=$(check_uri_exists "$url" "$existing_uris")

    if [ "$existing_uri" = true ]; then
        echo "A job with URI $url already exists. Skipping creation."
        continue
    fi

    echo "Creating new job: $job_name"
    gcloud scheduler jobs create http "$job_name" \
        --project="$PROJECT_ID" \
        --location="$REGION" \
        --schedule="$schedule" \
        --uri="$url" \
        --http-method="POST" \
        --oidc-service-account-email="$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
        --oidc-token-audience="$url" \
        --time-zone="Europe/Paris" \
        --attempt-deadline="320s"
   gcloud scheduler jobs pause "$job_name" \
        --project="$PROJECT_ID" \
        --location="$REGION"
}

# Function to extract schedule from file
extract_schedule() {
    local file=$1
    local schedule=$(grep "const schedule" "$file" | sed -E "s/^.*['\"](.*)['\"].*$/\1/")
    if [ -z "$schedule" ]; then
        echo "ERROR: No schedule found in $file" >&2
        return 1
    else
        echo "$schedule"
    fi
}

# Function to extract route from file
extract_route() {
    local file=$1
    local task_name=$2
    local route=$(grep "const route" "$file" | sed -E "s/^.*['\"](.*)['\"].*$/\1/")
    if [ -z "$route" ]; then
        echo "ERROR: No route found in $file" >&2
        return 1
    else
        if [[ $route != $task_name ]]; then
            echo "Error: Route $route does not match task name $task_name" >&2
            return 1
        fi
        echo $route
    fi
}

# Function to extract if this is a prod only task
is_prod_only() {
    local file=$1
    local prod_only=$(grep "const prodOnly" "$file" | sed -E "s/^.*= (true|false).*$/\1/")    
    if [ -z "$prod_only" ]; then
        echo "ERROR: No prodOnly found in $file" >&2
        return 1
    else
        echo $prod_only
    fi
}

# Function to process controller files
process_controller_files() {
    local search_dir="$1"
    
    echo "Searching for controller files in $search_dir..."
    
    find "$search_dir" -type f -name "*task.controller.ts" | while read -r file; do
        echo "Processing file: $file"
        
         # Extract the base name of the file
        base_name=$(basename "$file" .controller.ts)
        task_name=$(echo "$base_name" | sed 's/.task//g')
        
        # Add "-$NODE_ENV" to the job name
        job_name="$task_name-$NODE_ENV"
        
        schedule=$(extract_schedule "$file")
        route=$(extract_route "$file" "$task_name")
        prodOnly=$(is_prod_only "$file")

        echo "Task name : $job_name"
        echo "Schedule : $schedule"
        echo "Route : $route"
        echo "Prod only : $prodOnly"

        if [[ "$prodOnly" == "true" && "$NODE_ENV" != *"prod"* ]]; then
            echo "Skipping job creation for $file due to prodOnly flag in non-production environment ($NODE_ENV)."
            continue
        fi

        if [ $? -ne 0 ]; then
            echo "Skipping job creation for $file due to missing schedule."
            continue
        fi
        
        url="$APP_URL/$task_name"
        
        create_scheduler_job "$job_name" "$schedule" "$url"
    done
}

# Get the project number
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# Main script execution
# Get existing job URIs
echo "Creating new Cloud Scheduler tasks from controller files..."
echo "Environment : $NODE_ENV"
process_controller_files "$ROOT_DIR"
echo "Task creation completed!"