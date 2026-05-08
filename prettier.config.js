module.exports = {
  printWidth: 120,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: true,
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      options: {
        parser: 'babel-ts',
      },
    },
  ],
  semi: true,
};
