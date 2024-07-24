package tree_sitter_pint_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-pint"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_pint.Language())
	if language == nil {
		t.Errorf("Error loading Pint grammar")
	}
}
