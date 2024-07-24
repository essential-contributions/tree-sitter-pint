# tree-sitter-pint

A tree-sitter grammar for the Pint programming language.

## Usage

Each editor integrates tree-sitter in a different way. Refer to your editor
(or editor tree-sitter plugin) documentation for how to include new language
tree-sitter grammars.

## Working on the grammar

The grammar is defined in `grammar.js`.

The parser may be generated from the `grammar.js` with `tree-sitter generate`.

Add to or update the tests in `test/corpus` and then check them with `tree-sitter test`.

Building tree-sitter grammars requires the `tree-sitter` CLI, nodejs and a C compiler.

If you have Nix, you can enter a shell with these tools using `nix develop`.
