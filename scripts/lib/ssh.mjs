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
    'command -v git >/dev/null 2>&1 || { echo "git nao encontrado"; exit 1; }',
    'command -v docker >/dev/null 2>&1 || { echo "docker nao encontrado"; exit 1; }',
    'docker compose version >/dev/null 2>&1 || { echo "docker compose plugin nao encontrado"; exit 1; }',
    `PROJECT_PATH=${shellEscape(projectPath)}`,
    `REPO_URL=${shellEscape(repo)}`,
    `BRANCH=${shellEscape(branch)}`,
    `ENV_FILE=${shellEscape(envFile)}`,
    'if [ -d "$PROJECT_PATH" ] && [ ! -d "$PROJECT_PATH/.git" ]; then',
    '  echo "Diretorio existe mas nao e um repositorio git: $PROJECT_PATH"',
    '  exit 1',
    'fi',
    'if [ ! -d "$PROJECT_PATH/.git" ]; then',
    '  mkdir -p "$PROJECT_PATH"',
    '  git clone --branch "$BRANCH" --single-branch "$REPO_URL" "$PROJECT_PATH"',
    'fi',
    'cd "$PROJECT_PATH"',
    'git remote set-url origin "$REPO_URL"',
    'git fetch origin "$BRANCH" --prune',
    'git checkout -B "$BRANCH" "origin/$BRANCH"',
    'if [ ! -f "$ENV_FILE" ]; then',
    '  echo "Arquivo de ambiente nao encontrado: $PROJECT_PATH/$ENV_FILE"',
    '  exit 1',
    'fi',
    'ENV_FILE="$ENV_FILE" docker compose --env-file "$ENV_FILE" build',
    'ENV_FILE="$ENV_FILE" docker compose --env-file "$ENV_FILE" up -d',
    'ENV_FILE="$ENV_FILE" docker compose --env-file "$ENV_FILE" ps',
  ].join('; ');
}
