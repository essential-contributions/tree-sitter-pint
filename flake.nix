{
  description = "Tree-sitter grammar for the Pint programming language";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    systems.url = "github:nix-systems/default";
  };

  outputs =
    inputs:
    let
      overlays = [ inputs.self.overlays.default ];

      # Call the given function with the nixpkgs package set for each supported system.
      perSystemPkgs =
        f:
        inputs.nixpkgs.lib.genAttrs (import inputs.systems) (
          system: f (import inputs.nixpkgs { inherit overlays system; })
        );
    in
    {
      # Add an overlay so that the grammar can be merged into the nixpkgs set.
      overlays = {
        tree-sitter-pint = final: prev: {
          tree-sitter-grammars.tree-sitter-pint = prev.callPackage ./default.nix { };
        };
        default = inputs.self.overlays.tree-sitter-pint;
      };

      # Declare the grammar as a package output.
      packages = perSystemPkgs (pkgs: {
        tree-sitter-pint = pkgs.tree-sitter-grammars.tree-sitter-pint;
        default = inputs.self.packages.${pkgs.system}.tree-sitter-pint;
      });

      # Use the newly standard nixfmt formatter.
      formatter = perSystemPkgs (pkgs: pkgs.nixfmt-rfc-style);
    };
}
