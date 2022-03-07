import { execa } from 'execa'
import prompts from 'prompts'

type WorkspacePackage = { name: string; version?: string; path: string }

const getPackages = async () => {
  const { stdout } = await execa('pnpm', [
    'ls',
    '-r',
    '--depth',
    '-1',
    '--json',
  ])

  return (JSON.parse(stdout) as WorkspacePackage[]).filter(
    (p) =>
      p.name !== 'growing-web-monorepo' &&
      p.name !== 'scripts' &&
      p.name.startsWith('playground-'),
  )
}

const runScript = async (pkg: WorkspacePackage, script: string) => {
  console.log(pkg.name)

  execa('pnpm', ['run', script, '--filter', `${pkg.name}...`, '--parallel'], {
    stdio: 'inherit',
    preferLocal: true,
  })
}

async function main() {
  const packages = await getPackages()
  const { name } = await prompts([
    {
      name: 'name',
      message: 'Choose the package to run dev script',
      type: 'select',
      choices: packages.map((p) => {
        return {
          title: p.name,
          value: p.name,
        }
      }),
    },
  ])
  runScript(packages.find((p) => p.name === name)!, 'dev')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
