{
  lib,
  stdenv,
  gcc,
  nodejs,
  tree-sitter,
}:

stdenv.mkDerivation {
  pname = "tree-sitter-pint";
  version = "0.1.0";

  src = lib.cleanSource ./.;

  buildInputs = [
    gcc
    nodejs
    tree-sitter
  ];

  # Generate the parser.
  configurePhase = ''
    tree-sitter generate
  '';

  # Build the parser using the C compiler.
  buildPhase = ''
    runHook preBuild
    if [[ -e src/scanner.c ]]; then
      $CC -fPIC -c src/scanner.c -o scanner.o $CFLAGS
    fi
    $CC -fPIC -c src/parser.c -o parser.o $CFLAGS
    rm -rf parser
    $CC -shared -o parser *.o
    runHook postBuild
  '';

  # Run the tests.
  checkPhase = ''
    tree-sitter test
  '';

  # Install the built parser and queries.
  installPhase = ''
    runHook preInstall
    mkdir -p $out
    mv parser $out/
    if [[ -d queries ]]; then
      cp -r queries $out
    fi
    runHook postInstall
  '';

  meta = {
    description = "Tree-sitter grammar for the Pint programming language";
    homepage = "https://essential.builders";
    license = lib.licenses.asl20;
    maintainers = with lib.maintainers; [ mitchmindtree ];
  };
}
