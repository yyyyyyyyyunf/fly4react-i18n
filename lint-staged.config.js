export default {
  '*.{ts,tsx,js,jsx,json,md,yml,yaml}': ['prettier --write'],
  '*.{ts,tsx}': ['oxlint -c .oxlintrc.json'],
};
