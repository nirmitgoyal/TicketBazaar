{pkgs}: {
  deps = [
    pkgs.nodePackages.prettier
    pkgs.postgresql
    pkgs.jdk
    pkgs.maven
  ];
}
