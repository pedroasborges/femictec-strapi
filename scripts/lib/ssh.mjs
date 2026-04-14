export function shellEscape(value) {
  const text = String(value);
  return `'${text.replace(/'/g, `'\\''`)}'`;
}

export function buildRemoteDeployScript(options) {
  const projectPath = options.projectPath;
  const repo = options.repo;
  const branch = options.branch;
  const envFile = options.envFile;

  return [
    'set -euo pipefail',
    `PROJECT_PATH=${shellEscape(projectPath)}`,
    `REPO_URL=${shellEscape(repo)}`,
    `BRANCH=${shellEscape(branch)}`,
    `ENV_FILE=${shellEscape(envFile)}`,
    'if [ ! -d "$PROJECT_PATH/.git" ]; then',
    '  mkdir -p "$PROJECT_PATH"',
    '  git clone "$REPO_URL" "$PROJECT_PATH"',
    'fi',
    'cd "$PROJECT_PATH"',
    'git fetch --all --prune',
    'git checkout "$BRANCH"',
    'git pull --ff-only origin "$BRANCH"',
    'ENV_FILE="$ENV_FILE" docker compose build',
    'ENV_FILE="$ENV_FILE" docker compose up -d',
    'ENV_FILE="$ENV_FILE" docker compose ps',
  ].join('; ');
}
