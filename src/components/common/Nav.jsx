import React from "react";
import { useHashRoute } from "../../lib/hashRouter";

export default function Nav() {
  const [r] = useHashRoute(); // r = "/times", "/perfil", "/"

  const links = [
    { href: "#/", path: "/", label: "Início" },
    { href: "#/campeonatos", path: "/campeonatos", label: "Campeonatos" },
    { href: "#/times", path: "/times", label: "Times" },
    { href: "#/jogadores", path: "/jogadores", label: "Jogadores" },
    { href: "#/relacoes", path: "/relacoes", label: "Relação Campeonatos × Times" },
    { href: "#/jogos", path: "/jogos", label: "Jogos" },
    { href: "#/estatisticas-time", path: "/estatisticas-time", label: "Estatísticas (Times)" },
    { href: "#/estatisticas-jogador", path: "/estatisticas-jogador", label: "Estatísticas (Jogadores)" },
    { href: "#/analises", path: "/analises", label: "Análises" },
    { href: "#/perfil", path: "/perfil", label: "Perfil" }
  ];

  return (
    <div className="nav">
      {links.map(link => {
        const isActive =
          (r === "/" && link.path === "/") ||    // só é ativo quando está realmente no início
          (r !== "/" && r.startsWith(link.path) && link.path !== "/"); // ativa o resto normalmente

        return (
          <a
            key={link.path}
            href={link.href}
            className={isActive ? "active" : ""}
          >
            {link.label}
          </a>
        );
      })}
    </div>
  );
}
