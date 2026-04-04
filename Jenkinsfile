pipeline {
    agent any

    environment {
        PROD_HOST     = credentials('prod-ec2-host')   // Jenkins credential: plain text IP
        PROD_USER     = 'ubuntu'
        APP_DIR       = '/var/www/djangoapp'
        VENV_DIR      = '/var/www/djangoapp/venv'
        DJANGO_SETTINGS_MODULE = 'myproject.settings.production'
    }

    stages {

        // ─────────────────────────────────────────────
        // 1. Pull latest code from GitHub SCM
        // ─────────────────────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
                echo "Checked out branch: ${env.GIT_BRANCH}"
            }
        }

        // ─────────────────────────────────────────────
        // 2. Set up venv and install deps on Jenkins VM
        // ─────────────────────────────────────────────
        stage('Install dependencies') {
            steps {
                sh '''
                    python3 -m venv venv
                    . venv/bin/activate
                    pip install --upgrade pip --quiet
                    pip install -r requirements.txt --quiet
                '''
            }
        }

        // ─────────────────────────────────────────────
        // 3. Run Django tests
        // ─────────────────────────────────────────────
        stage('Run tests') {
            steps {
                sh '''
                    . venv/bin/activate
                    python manage.py test --verbosity=2
                '''
            }
        }

        // ─────────────────────────────────────────────
        // 4. Deploy to prod — only on main branch
        // ─────────────────────────────────────────────
        stage('Deploy to production') {
            when {
                branch 'main'
            }
            steps {
                // 'prod-ssh-key' = Jenkins SSH credential (private key)
                sshagent(['prod-ssh-key']) {
                    sh """
                        echo "==> Syncing code to production server..."
                        rsync -avz \\
                            --exclude='.git' \\
                            --exclude='venv' \\
                            --exclude='__pycache__' \\
                            --exclude='*.pyc' \\
                            --exclude='.env' \\
                            -e 'ssh -o StrictHostKeyChecking=no' \\
                            ./ ${PROD_USER}@${PROD_HOST}:${APP_DIR}/

                        echo "==> Running remote deploy steps..."
                        ssh -o StrictHostKeyChecking=no ${PROD_USER}@${PROD_HOST} << 'REMOTE'
                            set -e
                            cd ${APP_DIR}

                            echo "-- Activating venv..."
                            source ${VENV_DIR}/bin/activate

                            echo "-- Installing/updating Python packages..."
                            pip install -r requirements.txt --quiet

                            echo "-- Running database migrations..."
                            python manage.py migrate --noinput

                            echo "-- Collecting static files..."
                            python manage.py collectstatic --noinput

                            echo "-- Restarting Gunicorn..."
                            sudo systemctl restart gunicorn

                            echo "-- Reloading Nginx..."
                            sudo systemctl reload nginx

                            echo "Deployment complete."
REMOTE
                    """
                }
            }
        }
    }

    // ─────────────────────────────────────────────
    // Post-pipeline notifications
    // ─────────────────────────────────────────────
    post {
        success {
            echo "Pipeline SUCCESS — ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        }
        failure {
            echo "Pipeline FAILED — ${env.JOB_NAME} #${env.BUILD_NUMBER} — check console output."
        }
        always {
            // Clean up local venv to keep Jenkins workspace tidy
            sh 'rm -rf venv'
        }
    }
}