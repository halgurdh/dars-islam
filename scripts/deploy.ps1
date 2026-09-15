Param(
  [string]$DeployHost = $env:DEPLOY_HOST -or 'darsislam.games',
  [string]$DeployUser = $env:DEPLOY_USER -or $env:USERNAME,
  [string]$DeployPath = $env:DEPLOY_PATH -or '/var/www/darsislam.games',
  [int]$SshPort = $env:SSH_PORT -or 22,
  [switch]$DryRun
)

Write-Host "Building project..."
node .\scripts\build.mjs
if ($LASTEXITCODE -ne 0) { Write-Error 'Build failed — aborting deploy.'; exit 1 }

Write-Host "Deploying to $DeployUser@$DeployHost:$DeployPath"

# Prefer rsync if available (WSL or msys), otherwise try scp (OpenSSH)
if (Get-Command rsync -ErrorAction SilentlyContinue) {
  $rsyncArgs = @('-az','--delete','-e',"ssh -p $SshPort")
  if ($DryRun) { $rsyncArgs += '--dry-run' }
  $rsyncArgs += 'dist/'
  $rsyncArgs += "$DeployUser@$DeployHost:$DeployPath"
  rsync @rsyncArgs
  exit $LASTEXITCODE
} elseif (Get-Command scp -ErrorAction SilentlyContinue) {
  scp -r -P $SshPort dist/* "$DeployUser@$DeployHost:$DeployPath"
  exit $LASTEXITCODE
} else {
  Write-Error 'Neither rsync nor scp is available. Install OpenSSH or rsync, or deploy manually.'
  exit 2
}
