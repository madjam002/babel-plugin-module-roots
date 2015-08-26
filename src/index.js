import fs from 'fs'
import path from 'path'

const PLUGIN_NAME = 'module-roots'

export default function({ Plugin, types: t }) {

  function mapModule(context, mod) {
    let { paths, extensions } = context.state.opts.extra[PLUGIN_NAME] || {}

    if (paths == null) {
      paths = ['./src']
    }

    if (extensions == null) {
      extensions = ['.js', '/index.js']
    }

    for (const p of paths) {
      const potentialPath = path.join(p, mod)

      // check if potential path exists
      for (const ext of extensions) {
        const potentialPathWithExt = potentialPath + ext

        if (fs.existsSync(potentialPathWithExt)) {
          return './' + path.relative(path.dirname(context.state.opts.filename), potentialPath)
        }
      }
    }
  }

  function transformImportCall(context, call) {
    const mod = call.source.value

    const newModule = mapModule(context, mod)
    if (newModule) {
      return t.importDeclaration(
        call.specifiers,
        t.literal(newModule),
      )
    }
  }

  return new Plugin(PLUGIN_NAME, {
    visitor: {
      ImportDeclaration: {
        exit(node) {
          return transformImportCall(this, node)
        }
      }
    }
  })

}
