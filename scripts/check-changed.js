const { execSync, spawnSync } = require('node:child_process');
const path = require('node:path');

// Get git diff files
const getChangedFiles = () => {
	// Get modified files
	const modifiedFiles = execSync('git diff --name-only HEAD').toString();
	// Get untracked files
	const untrackedFiles = execSync(
		'git ls-files --others --exclude-standard',
	).toString();

	// Combine both modified and untracked files
	return [...modifiedFiles.split('\n'), ...untrackedFiles.split('\n')]
		.filter((file) => file.match(/\.(ts|js|tsx|json)$/))
		.filter(Boolean);
};

// Run specific Biome command
const runBiomeCommand = (files, command = 'all') => {
	const rootDir = process.cwd();
	const fullPaths = files.map((file) => path.join(rootDir, file));

	if (fullPaths.length === 0) {
		console.log('No files to check');
		return;
	}

	// Wrap each path in quotes to handle special characters
	const filesList = fullPaths.map((file) => `"${file}"`).join(' ');

	const commands = {
		format: `biome format --write ${filesList}`,
		lint: `biome lint ${filesList}`,
		all: [`biome format --write ${filesList}`, `biome lint ${filesList}`],
	};

	const commandsToRun = Array.isArray(commands[command])
		? commands[command]
		: [commands[command]];

	for (const cmd of commandsToRun) {
		try {
			console.log(`Running: ${cmd}`);
			// Using spawnSync instead of execSync for better control
			const result = spawnSync('yarn', cmd.split(' '), {
				stdio: 'inherit',
				shell: true,
				encoding: 'utf-8',
			});
			// Don't throw error on non-zero exit codes
		} catch (error) {
			console.log('Command completed with warnings/errors');
		}
	}
};

// Get command from arguments
const command = process.argv[2] || 'all';

// Run the checks
const changedFiles = getChangedFiles();
runBiomeCommand(changedFiles, command);
