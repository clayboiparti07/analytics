# T.R.A.C (TRAC Real-time Analytics Conduit)

A simple and modern dashboard to display data from a Supabase database. This project consists of a Flask backend that provides a REST API and a Next.js frontend.

The dashboard is built with Tailwind CSS for a clean and responsive UI, and it features a dark mode. The project is fully configured for seamless deployment on [Vercel](https://vercel.com/).

<img src="Flow Diagram.png" alt="Dashboard Screenshot">
<small>Note: Generated using gemini</small>

## Features

- **Modern Dashboard**: A clean, responsive dashboard built with Next.js and Tailwind CSS to view data.
- **Dark Mode**: Toggle between light and dark themes.
- **Supabase Integration**: Uses Supabase as the data source.
- **Vercel Ready**: Pre-configured for quick and easy deployment via Vercel.
- **Advanced Filtering**: Filter data by country, device, browser, visitor type, and date range.
- **Multiple Chart Types**: View data as a timeline, a world map, a doughnut chart, and bar charts.
- **Sortable Table**: Sort the recent visitor activity table by any column.

## Tech Stack

- **Backend**: Python, Flask
- **Database**: Supabase (PostgreSQL)
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Chart.js, AmCharts
- **Deployment**: Vercel

## Project Structure

```
.
├── backend/             # Flask backend
├── frontend/            # Next.js frontend
├── supabase_analytics_function.sql # Supabase SQL function
├── vercel.json          # Vercel deployment configuration
└── README.md            # This file.
```

### Project Workflow Diagram


### Breakdown of the Workflow

1. **Data Ingestion (The Tracker):**
* An external website embeds the `tracker.js` script.
* When a user visits, the script gathers metadata (device type, browser, location, etc.) and sends a POST request to the **Flask** backend's webhook endpoint.


2. **Processing & Storage:**
* The **Flask** server receives the payload, processes it, and uses the Supabase Python SDK to store the entry in the `visitors` table.


3. **Data Retrieval (The API):**
* When you access the **Next.js** dashboard, the frontend calls the Flask REST API.
* The backend interacts with **Supabase**, often calling specialized SQL functions (like `get_filtered_analytics_visual`) to handle complex filtering and aggregation directly in the database for better performance.


4. **Visualization:**
* The processed data is sent back to the Next.js frontend as JSON.
* The dashboard uses **Chart.js** and **Tailwind CSS** to render the analytics, including visitor timelines, geographic maps, and device distribution charts.


## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

- Python 3.8+
- Node.js 18+
- A Supabase account.
- `git` for cloning the repository.

### 1. Set up Supabase

1.  Go to [Supabase](https://supabase.com/) and create a new project.
2.  Navigate to the **SQL Editor**.
3.  Click **New query** and run the SQL from the `supabase_analytics_function.sql` file to create the `visitors` table and the `get_filtered_analytics_visual` function.  
    *Note*: the function now uses case‑insensitive matching (`ILIKE`) and expects
    a normalized site URL (no trailing slash) so that filters such as
    `https://rbg.iitm.ac.in/tpl` match any sub‑path under `/tpl` regardless of
    letter casing.
4.  Optionally, run the SQL from `backend/indexes.sql` to add indexes for better performance.
5.  Navigate to **Project Settings** > **API**. Find your **Project URL** and **anon (public) key**. You will need these for the next step.

### 2. Local Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Raghavvram/js-flask-webhook-dashboard.git
    cd js-flask-webhook-dashboard
    ```

2.  **Set up environment variables:**
    Create a file named `.env` in the root of the project directory and add your Supabase credentials:
    ```
    SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
    SUPABASE_KEY="YOUR_SUPABASE_ANON_KEY"
    ```

3.  **Install backend dependencies and run the backend:**
    ```bash
    cd backend
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    flask run
    ```

4.  **Install frontend dependencies and run the frontend:**
    In a new terminal, navigate to the `frontend` directory:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

    The application will be running at `http://localhost:3000`.

## Javascript 

For the website to work, we need to embed the following script tag in the body of the html page (put it at the last)

```html
<script src="https://embed-js-script.pages.dev/tracker.js"></script>
```

This JS function fecthes the necessary functions and sends it to the webhook ( if you want to use your own deployment, copy the JS code and change the webhook to your custom URL )

## Deployment to Vercel

This project is pre-configured for deployment on Vercel.

1.  **Sign up and Install CLI**:
    - Create an account at [vercel.com](https://vercel.com/).
    - Install the Vercel CLI globally: `npm install -g vercel`.

2.  **Deploy**:
    - Run the deployment command from the project's root directory:
      ```bash
      vercel
      ```
    - Follow the on-screen prompts. Vercel will automatically detect the `vercel.json` configuration and deploy the application. You will need to set the `SUPABASE_URL` and `SUPABASE_KEY` environment variables during the setup process.

## Production CI/CD

The repository is now wired for automatic production deploys from GitHub.

1. Push to the `prod` branch.
2. GitHub Actions sends the job to a self-hosted runner installed on your local VM.
3. The runner checks out the `prod` branch, runs `docker compose up -d --build --remove-orphans`, and waits for the containers to become healthy.

Before enabling it, install a self-hosted GitHub Actions runner on the VM and give it the `prod` label so this workflow can target it.

The runner machine must already have Docker and Docker Compose available.

### Ubuntu VM runner setup

Run these commands on your Ubuntu VM. Replace `OWNER/REPO` with your GitHub repository and use the runner version GitHub shows for the latest Linux x64 release if you want to pin a specific version.

```bash
sudo apt-get update
sudo apt-get install -y curl tar git

mkdir -p ~/actions-runner && cd ~/actions-runner
curl -o actions-runner-linux-x64.tar.gz -L https://github.com/actions/runner/releases/download/v2.323.0/actions-runner-linux-x64-2.323.0.tar.gz
tar xzf ./actions-runner-linux-x64.tar.gz

./config.sh --url https://github.com/OWNER/REPO --token YOUR_RUNNER_REGISTRATION_TOKEN --labels prod --unattended

sudo ./svc.sh install
sudo ./svc.sh start
```

If you prefer to reconfigure an existing runner later, stop the service first:

```bash
sudo ./svc.sh stop
./config.sh remove --token YOUR_REMOVAL_TOKEN
```

If Docker requires elevated permissions on the VM, add the runner user to the docker group and log out/in once:

```bash
sudo usermod -aG docker $USER

### Run DB as a permanent container (recommended)

To ensure the Postgres database container is persistent and not recreated by normal deploys, run the DB with the dedicated compose file once on the VM. This keeps the DB service out of the regular deploy flow.

```bash
# Start the DB as a long-running service (do this once)
docker compose -f docker-compose.db.yml up -d

# Verify it's healthy
docker compose -f docker-compose.db.yml ps
```

The `docker-compose.db.yml` file contains the same DB configuration as the main compose but is intended to be started and managed separately. It uses a named volume (`postgres_data`) so the database files persist across container restarts.

### Run GitHub Actions runner inside Docker on the same host

You can run the self-hosted Actions runner as a container so it coexists with your app stack. Edit `docker-compose.runner.yml`, replace `OWNER/REPO` and `__REPLACE_WITH_TOKEN__` (get the token from GitHub when you add a new runner), then start it:

```bash
docker compose -f docker-compose.runner.yml up -d
```

Notes:
- The runner service mounts the Docker socket so CI jobs can run Docker commands (this is convenient but increases risk; only use on trusted hosts).
- Make sure the runner has the `prod` label (the compose file sets `RUNNER_LABELS=prod`).
- Obtain the runner token from GitHub: Repository > Settings > Actions > Runners > New self-hosted runner.

### Deploy workflow behavior

The production workflow now runs on a self-hosted runner (label `prod`) and no longer passes `--remove-orphans`, so it will not forcibly remove containers such as the DB container started from `docker-compose.db.yml`.
```

## License

This project is open-source and available under the [MIT License](LICENSE).
