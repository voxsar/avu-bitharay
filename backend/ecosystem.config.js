/**
 * PM2 Ecosystem Configuration
 * Serves the API at api.avurudhu.artslabcreatives.com
 *
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 reload ecosystem.config.js  (zero-downtime reload)
 *   pm2 save                        (persist on reboot)
 *   pm2 startup                     (enable auto-start)
 */

module.exports = {
	apps: [
		{
			name: 'avu-bitharay-api',
			script: 'server.js',
			cwd: __dirname,

			// Number of instances — use 'max' to use all CPU cores,
			// or 1 for a single process (SQLite works best with 1 writer)
			instances: 1,
			exec_mode: 'fork',

			// Restart automatically on crash
			autorestart: true,
			watch: false,
			max_memory_restart: '200M',

			// Use .env file for environment variables
			env_file: '.env',
			env: {
				NODE_ENV: 'production',
			},

			// Log file locations (PM2 default: ~/.pm2/logs/)
			out_file: './logs/api-out.log',
			error_file: './logs/api-error.log',
			log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
		},
	],
};
