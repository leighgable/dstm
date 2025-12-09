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
          pythonEnv = pkgs.python3.withPackages (p: [
            p.ipython
	          p.google-genai
	    p.pillow
          ]);

          dstm = pkgs.stdenv.mkDerivation {
            pname = "dstm-image-jen";
            version = "0.1.0";
            src = ./.;
            buildInputs = with pkgs; [
              pythonEnv
              uv
            ];

            installPhase = ''
              mkdir -p $out/bin

              APP_ROOT_PATH="$out"
              # Pre-create destination directories to guarantee they exist
              mkdir -p $out/src

              # This pattern ($src/dir/., $out/dir/) is the most robust copy method.
              cp -r $src/src/. $out/src/
              # ------------------------------------------
              # ls -la $src
              # echo "_________________"
              # ls -la $out
              # create a startup script
              cat > $out/bin/start-server << EOF
              #!${pkgs.stdenv.shell}
              if [ -z "$MODEL_PATH" ]; then
                echo "Error: MODEL_PATH environment variable is not set."
                echo "Please set it to the path of the model file."
                exit 1
              fi

            '';
          };
          dockerImage = pkgs.dockerTools.buildLayeredImage {
            name = "dstm-image-jen";
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
          inherit pkgs dstm dockerImage pythonEnv;
        };
      allConfigs = forAllSystems systemConfigurations;

      in
      {
        devShells = forAllSystems (system: {
          default = allConfigs.${system}.pkgs.mkShell {
            packages = [
              allConfigs.${system}.pythonEnv
              allConfigs.${system}.pkgs.uv
              # allConfigs.${system}.pkgs.nodejs_22
            ];
            shellHook = ''
              unset PYTHONPATH
              uv sync --upgrade
              . .venv/bin/activate
              uv pip install -r requirements.txt --quiet
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

