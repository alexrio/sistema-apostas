import React, { useEffect, useState, useCallback } from "react";
import { useHashRoute } from "../../lib/hashRouter";
import { useApp } from "../../context/AppProvider";
import { canWrite } from "../../utils/roles";

export default function Nav() {
  const [current] = useHashRoute();
  const { supa } = useApp();
  const [canEdit, setCanEdit] = useState(false);
  const [open, setOpen] = useState(null); // "cadastros" | "relacionamentos" | "estatisticas" | null

  useEffect(() => {
    (async () => setCanEdit(await canWrite(supa)))();
  }, [supa]);

  const isActive = useCallback(
    (prefixes = []) => prefixes.some((p) => current.startsWith(p)),
    [current]
  );

  const isExact = useCallback((exact) => current === exact, [current]);

  const closeAll = () => setOpen(null);
  const openOnly = (key) => setOpen(key);

  useEffect(() => {
    closeAll();
  }, [current]);

  const handleGroupPointerLeave = (e) => {
    const container = e.currentTarget;
    const next = e.relatedTarget;

    if (!container || !(container instanceof Node)) {
      setOpen(null);
      return;
    }

    if (!next || !(next instanceof Node)) {
      setOpen(null);
      return;
    }

    if (!container.contains(next)) {
      setOpen(null);
    }
  };

  const triggerProps = (key, active) => ({
    className: `nav-trigger ${active ? "active" : ""}`,
    onPointerEnter: () => openOnly(key),
    onFocus: () => openOnly(key),
    onClick: (e) => {
      e.preventDefault();
      setOpen((prev) => (prev === key ? null : key));
    },
    "aria-expanded": open === key,
    "aria-haspopup": "true",
  });

  const groupProps = (key) => ({
    className: `group ${open === key ? "open" : ""}`,
    onPointerEnter: () => openOnly(key),
    onPointerLeave: handleGroupPointerLeave,
  });

  const linkClick = () => setTimeout(closeAll, 0);

  return (
    <nav className="nav nav--bar" role="navigation">
      <a className={`nav-link ${isExact("/") ? "active" : ""}`} href="#/">
        Início
      </a>

      {canEdit && (
        <div {...groupProps("cadastros")}>
          <a
            href="#"
            {...triggerProps(
              "cadastros",
              isActive([
                "/arbitros",
                "/campeonatos",
                "/estadios",
                "/jogos",
                "/jogadores",
                "/times",
              ])
            )}
          >
            Cadastros
          </a>
          <div className="submenu" role="menu" aria-label="Cadastros">
            <a href="#/arbitros" onClick={linkClick}>Árbitros</a>
            <a href="#/campeonatos" onClick={linkClick}>Campeonatos</a>
            <a href="#/estadios" onClick={linkClick}>Estádios</a>
            <a href="#/jogos" onClick={linkClick}>Jogos</a>
            <a href="#/jogadores" onClick={linkClick}>Jogadores</a>
            <a href="#/times" onClick={linkClick}>Times</a>
          </div>
        </div>
      )}

      {canEdit && (
        <div {...groupProps("relacionamentos")}>
          <a
            href="#"
            {...triggerProps("relacionamentos", isActive(["/relacoes"]))}
          >
            Relacionamentos
          </a>
          <div className="submenu" role="menu" aria-label="Relacionamentos">
            <a href="#/relacoes" onClick={linkClick}>
              Campeonatos × Times
            </a>
          </div>
        </div>
      )}

      <div {...groupProps("estatisticas")}>
        <a
          href="#"
          {...triggerProps(
            "estatisticas",
            isActive([
              "/estatisticas-arbitros",
              "/estatisticas-estadios",
              "/estatisticas-jogos",
              "/estatisticas-jogador",
              "/estatisticas-time",
            ])
          )}
        >
          Estatísticas
        </a>
        <div className="submenu" role="menu" aria-label="Estatísticas">
          <a href="#/estatisticas-arbitros" onClick={linkClick}>Árbitros</a>
          <a href="#/estatisticas-estadios" onClick={linkClick}>Estádios</a>
          <a href="#/estatisticas-jogos" onClick={linkClick}>Jogos</a>
          <a href="#/estatisticas-jogador" onClick={linkClick}>Jogadores</a>
          <a href="#/estatisticas-time" onClick={linkClick}>Times</a>
        </div>
      </div>

      <a
        className={`nav-link ${isActive(["/analises"]) ? "active" : ""}`}
        href="#/analises"
        onClick={linkClick}
      >
        Análises
      </a>
    </nav>
  );
}
