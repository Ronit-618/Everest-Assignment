const OpenCC = require('opencc-js')
const fs = require('fs')
const path = require('path')

const args = process.argv.slice(2)

if (args.length !== 3) {
  console.log('Usage: node convert.js <mode> <sourceDir> <outputDir>')
  console.log('Example: node convert.js traditional source output')
  console.log('Example: node convert.js simplified output back')
  process.exit(1)
}

const [mode, sourceDir, outputDir] = args

if (!fs.existsSync(sourceDir)) {
  console.error(`Source directory "${sourceDir}" does not exist`)
  process.exit(1)
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
  console.log(`Created output directory: ${outputDir}`)
}

let converter

if (mode === 'traditional') {
  converter = OpenCC.Converter({ from: 'cn', to: 'tw' })
} else if (mode === 'simplified') {
  converter = OpenCC.Converter({ from: 'tw', to: 'cn' })
} else {
  console.error('Invalid mode. Use "traditional" or "simplified"')
  process.exit(1)
}

const files = fs.readdirSync(sourceDir).filter(file => fs.statSync(path.join(sourceDir, file)).isFile())

console.log(`Converting ${files.length} files from ${sourceDir} to ${outputDir} (${mode} mode)`)

files.forEach(file => {
  const sourcePath = path.join(sourceDir, file)
  const outputPath = path.join(outputDir, file)
  
  const originalText = fs.readFileSync(sourcePath, 'utf-8')
  const convertedText = converter(originalText)
  
  fs.writeFileSync(outputPath, convertedText, 'utf-8')
  
  console.log(`\n--- ${file} ---`)
  console.log('Before:', originalText)
  console.log('After:', convertedText)
})

console.log('\nConversion complete!')
