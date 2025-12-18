{
  description = "AI on Nix with uv";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs =
    { nixpkgs, ... }:
    let
      inherit (nixpkgs) lib;
      forAllSystems = lib.genAttrs lib.systems.flakeExposed;

      systemConfigurations = system:
        let
          pkgs = nixpkgs.legacyPackages.${system};

          dstm = pkgs.buildNpmPackage {
            pname = "dstm";
            version = "0.1.0";
            src = ./.;
            
            npmDeps = pkgs.importNpmLock { npmRoot = ./backend; };
            npmConfigHook = pkgs.importNpmLock.npmConfigHook;
          };

          dockerImage = pkgs.dockerTools.buildLayeredImage {
            name = "dstm_docker";
            tag = "latest";

            contents = [ pkgs.glibc pkgs.bash pkgs.coreutils ];
            
            config.ExposedPorts = {
              "7860/tcp" = {};
              "8080/tcp" = {};
            };
            config.Cmd = [ "${pkgs.bash}/bin/bash" "-c" ". ${dstm}/bin/start-server" ];
            config.User = "0";
            config.WorkingDir = "${dstm}";
          };
        in
        {
          inherit pkgs dstm dockerImage;
        };
      allConfigs = forAllSystems systemConfigurations;

      in
      {
        devShells = forAllSystems (system: {
          default = allConfigs.${system}.pkgs.mkShell {
            packages = [
              allConfigs.${system}.pkgs.nodejs_22
              allConfigs.${system}.dstm
            ];
            shellHook = ''
              GEMINI_API_KEY=$(cat key.txt)
              export GEMINI_API_KEY
              alias npm='nix run .#npm --'
              alias npx='nix run .#npx --'              
            '';
          };
        });

        packages = forAllSystems (system: {
          default = allConfigs.${system}.dstm;
          docker = allConfigs.${system}.dockerImage;
        });
      };
  }

