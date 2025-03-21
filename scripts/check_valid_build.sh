echo "Checking for a valid build..."


if ! yarn tsc -p tsconfig.build.json; then
  echo "=== ! TYPESCRIPT CHECKS FAILED ! ==="
  echo "Abort commit"
  exit 1
fi

yarn typeorm:test schema:drop
yarn typeorm:test migration:run

if ! yarn build; then
  echo "=== ! BUILD FAILED ! ==="
  echo "Abort commit"
  exit 1
fi

if ! yarn test --no-cache; then
  echo "=== ! TESTS FAILED ! ==="
  echo "Abort commit"
  exit 1
fi

echo "Build is valid !"

exit 0
